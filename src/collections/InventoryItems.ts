import type { CollectionConfig } from 'payload'

export const InventoryItems: CollectionConfig = {
  slug: 'inventory-items',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'quantity', 'brand', 'owner'],
  },
  access: {
    // Only Payload admin users can access inventory via Payload CMS
    // Bar patrons access inventory through NextAuth-protected API routes
    read: ({ req: { user } }) => {
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
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 1,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Liquor', value: 'liquor' },
        { label: 'Mixer', value: 'mixer' },
        { label: 'Wine', value: 'wine' },
      ],
    },
    {
      name: 'brand',
      label: 'Brand',
      type: 'text',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
    {
      name: 'purchaseDate',
      label: 'Purchase Date',
      type: 'date',
    },
    {
      name: 'owner',
      label: 'Owner',
      type: 'relationship',
      relationTo: 'bar-patrons',
      required: true,
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
