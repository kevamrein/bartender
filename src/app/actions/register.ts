'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: FormData) {
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

    // Create user
    const user = await payload.create({
      collection: 'bar-patrons',
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    })

    return { success: true, user: { id: user.id, email: user.email } }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, message: 'Registration failed. Please try again.' }
  }
}
