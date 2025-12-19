import config from '@payload-config'
import { getPayload } from 'payload'
import { xAIResponsesRequest, extractAnswerFromResponse, defaultModel } from './ai-service'

export interface AskBartenderRequest {
  question: string
  userId: string
  activeAccountId?: string
  previousResponseId?: string
}

export interface AskBartenderResponse {
  answer: string
  responseId?: string
}

export async function askBartenderQuestion(
  request: AskBartenderRequest
): Promise<AskBartenderResponse> {
  const { question, userId, activeAccountId, previousResponseId } = request

  let userContent = question

  if (!previousResponseId) {
    // Use activeAccountId if provided, otherwise fall back to userId
    const accountId = activeAccountId || userId
    const inventoryContext = await buildInventoryContext(accountId)
    userContent = `Bar Inventory:\n${inventoryContext}\n\nUser's question: ${question}`
  }

  const inputMessages = [
    {
      role: 'system',
      content: `You are a friendly, knowledgeable bartender assistant with a warm personality. You have access to the user's home bar inventory and can:

- Suggest cocktails they can make with their current inventory
- Recommend what ingredients to buy to expand their cocktail options
- Provide recipes and mixing instructions
- Offer pairing suggestions for food or occasions
- Give advice on bar organization and stock management
- Share interesting facts about spirits and cocktail history

Keep responses conversational, fun, and helpful. Use a warm, inviting tone like a friendly bartender would.
If they're missing ingredients for a drink, suggest alternatives from their inventory or recommend what to buy.
Format cocktail recipes clearly with ingredients and steps.
Feel free to use occasional bartender expressions and be encouraging about their bar collection!`,
    },
    {
      role: 'user',
      content: userContent,
    },
  ]

  try {
    const body = JSON.stringify({
      model: defaultModel,
      input: inputMessages,
      previous_response_id: previousResponseId,
    })

    const response = await xAIResponsesRequest(body)
    const answer = extractAnswerFromResponse(response.output)

    return { answer, responseId: response.id }
  } catch (error) {
    console.error('Error in askBartenderQuestion:', error)
    throw error
  }
}

async function buildInventoryContext(userId: string): Promise<string> {
  const payload = await getPayload({ config })

  const items = await payload.find({
    collection: 'inventory-items',
    where: { owner: { equals: userId } },
    limit: 100,
  })

  if (items.docs.length === 0) {
    return 'No items in inventory yet.'
  }

  const byCategory: Record<string, string[]> = {
    liquor: [],
    mixer: [],
    wine: [],
  }

  for (const item of items.docs) {
    const name = item.name as string
    const brand = item.brand as string | undefined
    const quantity = item.quantity as number
    const category = item.category as string

    const desc = brand
      ? `${name} (${brand}) x${quantity}`
      : `${name} x${quantity}`

    if (category in byCategory) {
      byCategory[category].push(desc)
    }
  }

  return `
Liquor: ${byCategory.liquor.length > 0 ? byCategory.liquor.join(', ') : 'None'}
Mixers: ${byCategory.mixer.length > 0 ? byCategory.mixer.join(', ') : 'None'}
Wine: ${byCategory.wine.length > 0 ? byCategory.wine.join(', ') : 'None'}
  `.trim()
}
