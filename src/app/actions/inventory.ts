'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import getSession from './auth-utils'

export type InventoryItem = {
  id: string
  name: string
  quantity: number
  category: 'liquor' | 'mixer' | 'wine'
  brand?: string | null
  notes?: string | null
  purchaseDate?: string | null
  owner: string | { id: string }
  createdAt: string
  updatedAt: string
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const session = await getSession()
  if (!session?.user?.id) return []

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'inventory-items',
      where: { owner: { equals: session.user.id } },
      sort: '-createdAt',
      limit: 100,
    })

    return result.docs as unknown as InventoryItem[]
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return []
  }
}

export async function createInventoryItem(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const quantity = Number(formData.get('quantity'))
  const category = formData.get('category') as string
  const brand = formData.get('brand') as string
  const notes = formData.get('notes') as string
  const purchaseDate = formData.get('purchaseDate') as string

  if (!name || !category) {
    return { success: false, message: 'Name and category are required' }
  }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'inventory-items',
      data: {
        name,
        quantity: quantity || 1,
        category,
        brand: brand || undefined,
        notes: notes || undefined,
        purchaseDate: purchaseDate || undefined,
        owner: session.user.id,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return { success: false, message: 'Failed to create item' }
  }
}

export async function updateInventoryItem(id: string, formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const payload = await getPayload({ config })

    // Verify ownership
    const item = await payload.findByID({
      collection: 'inventory-items',
      id,
    })

    const ownerId = typeof item.owner === 'object' ? item.owner.id : item.owner
    if (ownerId !== session.user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await payload.update({
      collection: 'inventory-items',
      id,
      data: {
        name: formData.get('name') as string,
        quantity: Number(formData.get('quantity')),
        category: formData.get('category') as string,
        brand: (formData.get('brand') as string) || undefined,
        notes: (formData.get('notes') as string) || undefined,
        purchaseDate: (formData.get('purchaseDate') as string) || undefined,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return { success: false, message: 'Failed to update item' }
  }
}

export async function deleteInventoryItem(id: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    const payload = await getPayload({ config })

    // Verify ownership
    const item = await payload.findByID({
      collection: 'inventory-items',
      id,
    })

    const ownerId = typeof item.owner === 'object' ? item.owner.id : item.owner
    if (ownerId !== session.user.id) {
      return { success: false, message: 'Unauthorized' }
    }

    await payload.delete({
      collection: 'inventory-items',
      id,
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return { success: false, message: 'Failed to delete item' }
  }
}
