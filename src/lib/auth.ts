import { getPayload } from 'payload'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import config from '@payload-config'
import { getUserAccountInfo, type AccountAccess } from './account-utils'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        try {
          const payload = await getPayload({ config })

          const result = await payload.find({
            collection: 'bar-patrons',
            where: {
              email: { equals: credentials.email },
            },
          })

          if (!result.docs || result.docs.length === 0) {
            return null
          }

          const user = result.docs[0]

          const passwordMatches = await bcrypt.compare(
            credentials.password,
            user.password as string
          )

          if (!passwordMatches) {
            return null
          }

          return {
            id: String(user.id),
            email: user.email as string,
            firstName: (user.firstName as string) || '',
            lastName: (user.lastName as string) || '',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = user.firstName
        token.lastName = user.lastName

        // Fetch account info including accessible accounts
        const accountInfo = await getUserAccountInfo(user.id)
        if (accountInfo) {
          token.accessibleAccounts = accountInfo.accessibleAccounts
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.accessibleAccounts = (token.accessibleAccounts as AccountAccess[]) || []
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      accessibleAccounts: AccountAccess[]
    }
  }
  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    firstName: string
    lastName: string
    accessibleAccounts: AccountAccess[]
  }
}
