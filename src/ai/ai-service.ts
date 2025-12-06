export const defaultModel = 'grok-2-latest'

export interface ResponsesAPIResponse {
  output: any[]
  id: string
}

export async function xAIResponsesRequest(body: string): Promise<ResponsesAPIResponse> {
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
    },
    body: body,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`xAI API error: ${response.statusText}. Details: ${errorText}`)
  }

  const data = await response.json()
  return { output: data.output, id: data.id }
}

export function extractAnswerFromResponse(output: any): string {
  if (Array.isArray(output)) {
    for (const item of output) {
      if (item.content && Array.isArray(item.content)) {
        for (const contentItem of item.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            return contentItem.text
          }
        }
      }
    }
    const textItem = output.find((item: any) => item.type === 'text')
    return textItem?.content || output[0]?.content || ''
  }
  return String(output)
}
