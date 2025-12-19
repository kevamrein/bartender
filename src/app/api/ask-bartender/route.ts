import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { askBartenderQuestion } from '@/ai/bartender-question'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, responseId, activeAccountId } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    // Validate user has access to the activeAccountId if provided
    if (activeAccountId && activeAccountId !== session.user.id) {
      // For backward compatibility: if accessibleAccounts is missing (old JWT tokens),
      // allow access to their own account
      const hasAccess =
        session.user.accessibleAccounts?.some((acc) => acc.id === activeAccountId) ||
        activeAccountId === session.user.id

      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized access to account' }, { status: 403 })
      }
    }

    const result = await askBartenderQuestion({
      question,
      userId: session.user.id,
      activeAccountId: activeAccountId || session.user.id,
      previousResponseId: responseId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in ask-bartender API:', error)
    return NextResponse.json(
      { error: 'Failed to get response from bartender' },
      { status: 500 }
    )
  }
}
