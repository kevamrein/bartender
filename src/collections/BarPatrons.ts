import type { CollectionConfig } from 'payload'

export const BarPatrons: CollectionConfig = {
  slug: 'bar-patrons',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    // Only Payload admin users (from Users collection) can access this via Payload CMS
    // Bar patrons use NextAuth separately and never touch Payload
    read: ({ req: { user } }) => {
      // Must be logged into Payload as an admin user
      return !!user
    },
    create: ({ req: { user } }) => {
      return !!user
    },
    update: ({ req: { user } }) => {
      return !!user
    },
    delete: ({ req: { user } }) => {
      return !!user
    },
  },
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'householdMemberOf',
      label: 'Household Member Of',
      type: 'relationship',
      relationTo: 'bar-patrons',
      hasMany: true,
      admin: {
        description: 'Accounts this user can access and manage. Can be multiple accounts.',
      },
      validate: (value, { data }) => {
        // Prevent self-reference
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          data &&
          typeof data === 'object' &&
          'id' in data
        ) {
          const userId = (data as { id: string }).id
          // Check if any of the values match the user's own ID
          for (const item of value) {
            const itemId = typeof item === 'object' && item !== null && 'value' in item ? item.value : item
            if (itemId === userId) {
              return 'Cannot be a household member of yourself'
            }
          }
        }
        return true
      },
    },
    {
      name: 'createdBy',
      label: 'Created By',
      type: 'relationship',
      relationTo: 'bar-patrons',
      hasMany: false,
      admin: {
        readOnly: true,
        description: 'The account that created this user (for audit purposes)',
      },
    },
  ],
}
