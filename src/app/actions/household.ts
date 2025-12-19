'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import bcrypt from 'bcryptjs'
import getSession from './auth-utils'
import { revalidatePath } from 'next/cache'

export type HouseholdMember = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
}

export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  const session = await getSession()
  if (!session?.user?.id) {
    return []
  }

  try {
    const payload = await getPayload({ config })

    // Find all users where householdMemberOf array contains the current user's ID
    const result = await payload.find({
      collection: 'bar-patrons',
      where: {
        householdMemberOf: {
          contains: session.user.id,
        },
      },
      sort: '-createdAt',
    })

    return result.docs.map((doc) => ({
      id: doc.id,
      email: doc.email as string,
      firstName: doc.firstName as string | undefined,
      lastName: doc.lastName as string | undefined,
      createdAt: doc.createdAt,
    }))
  } catch (error) {
    console.error('Error fetching household members:', error)
    return []
  }
}

export async function createHouseholdMember(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' }
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' }
  }

  try {
    const payload = await getPayload({ config })

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'bar-patrons',
      where: { email: { equals: email } },
    })

    if (existingUser.docs.length > 0) {
      return { success: false, message: 'An account with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create household member
    await payload.create({
      collection: 'bar-patrons',
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        householdMemberOf: [session.user.id], // Array with current user's ID
        createdBy: session.user.id,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating household member:', error)
    return { success: false, message: 'Failed to create household member' }
  }
}

export async function removeHouseholdMember(memberId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const payload = await getPayload({ config })

    // Fetch the member to verify and update
    const member = await payload.findByID({
      collection: 'bar-patrons',
      id: memberId,
    })

    // Verify this user is in the member's householdMemberOf array
    const householdArray = Array.isArray(member.householdMemberOf)
      ? member.householdMemberOf.map((ref) => (typeof ref === 'object' ? ref.id : ref))
      : []

    if (!householdArray.includes(session.user.id)) {
      return { success: false, message: 'Unauthorized' }
    }

    // Remove current user's ID from the householdMemberOf array
    const updatedHouseholdArray = householdArray.filter((id) => id !== session.user.id)

    await payload.update({
      collection: 'bar-patrons',
      id: memberId,
      data: {
        householdMemberOf: updatedHouseholdArray,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error removing household member:', error)
    return { success: false, message: 'Failed to remove household member' }
  }
}
