import type { CollectionConfig } from 'payload'

export const BarPatrons: CollectionConfig = {
  slug: 'bar-patrons',
  admin: {
    useAsTitle: 'email',
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
  ],
}
