'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export type AccountAccess = {
  id: string
  name: string
  email: string
}

export type UserAccountInfo = {
  userId: string
  ownAccount: AccountAccess
  householdAccounts: AccountAccess[]
  accessibleAccounts: AccountAccess[]
}

export async function getUserAccountInfo(userId: string): Promise<UserAccountInfo | null> {
  try {
    const payload = await getPayload({ config })

    // Fetch the user's own account info
    const user = await payload.findByID({
      collection: 'bar-patrons',
      id: userId,
    })

    if (!user) return null

    // Create own account object
    const ownAccount: AccountAccess = {
      id: String(user.id),
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      email: user.email as string,
    }

    // Fetch household accounts (accounts this user is a member of)
    const householdAccounts: AccountAccess[] = []

    if (user.householdMemberOf && Array.isArray(user.householdMemberOf)) {
      for (const householdRef of user.householdMemberOf) {
        const householdId = typeof householdRef === 'object' ? householdRef.id : householdRef

        try {
          const householdUser = await payload.findByID({
            collection: 'bar-patrons',
            id: householdId,
          })

          if (householdUser) {
            householdAccounts.push({
              id: String(householdUser.id),
              name:
                [householdUser.firstName, householdUser.lastName].filter(Boolean).join(' ') ||
                householdUser.email,
              email: householdUser.email as string,
            })
          }
        } catch (error) {
          console.error(`Error fetching household account ${householdId}:`, error)
        }
      }
    }

    // Create accessible accounts array: own account first, then household accounts
    const accessibleAccounts: AccountAccess[] = [ownAccount, ...householdAccounts]

    return {
      userId,
      ownAccount,
      householdAccounts,
      accessibleAccounts,
    }
  } catch (error) {
    console.error('Error getting user account info:', error)
    return null
  }
}
