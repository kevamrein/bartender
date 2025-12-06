'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { createInventoryItem, updateInventoryItem, type InventoryItem } from '@/app/actions/inventory'

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editItem?: InventoryItem | null
}

export function AddItemModal({ open, onClose, onSuccess, editItem }: AddItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(editItem?.category || '')

  const isEditing = !!editItem

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('category', category)

    try {
      const result = isEditing
        ? await updateInventoryItem(editItem.id, formData)
        : await createInventoryItem(formData)

      if (result.success) {
        onSuccess()
        onClose()
        setCategory('')
      } else {
        setError(result.message || 'Failed to save item')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      setCategory('')
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add to Your Bar'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your inventory item.' : 'Add a new item to your bar inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium font-display">
              Name *
            </label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Maker's Mark"
              defaultValue={editItem?.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium font-display">
                Category *
              </label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquor">Liquor</SelectItem>
                  <SelectItem value="mixer">Mixer</SelectItem>
                  <SelectItem value="wine">Wine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium font-display">
                Quantity
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={editItem?.quantity || 1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="brand" className="text-sm font-medium font-display">
              Brand
            </label>
            <Input
              id="brand"
              name="brand"
              placeholder="e.g., Bourbon"
              defaultValue={editItem?.brand || ''}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="purchaseDate" className="text-sm font-medium font-display">
              Purchase Date
            </label>
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              defaultValue={editItem?.purchaseDate?.split('T')[0] || ''}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium font-display">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="flex w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm font-body ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Any notes about this item..."
              defaultValue={editItem?.notes || ''}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !category}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
