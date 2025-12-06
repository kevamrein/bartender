'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Pencil, Trash2, Wine, GlassWater, Martini } from 'lucide-react'
import type { InventoryItem } from '@/app/actions/inventory'

interface InventoryCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
}

const categoryIcons = {
  liquor: Martini,
  mixer: GlassWater,
  wine: Wine,
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const [deleting, setDeleting] = useState(false)
  const Icon = categoryIcons[item.category]

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    setDeleting(true)
    await onDelete(item.id)
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              item.category === 'liquor' ? 'bg-amber/10 text-amber' :
              item.category === 'mixer' ? 'bg-cream text-wood-brown' :
              'bg-burgundy/10 text-burgundy'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">{item.name}</h3>
              {item.brand && (
                <p className="text-sm text-muted-foreground">{item.brand}</p>
              )}
            </div>
          </div>
          <Badge variant={item.category}>
            {item.category}
          </Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-primary">
                {item.quantity}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Qty
              </div>
            </div>
            {item.purchaseDate && (
              <div className="text-sm text-muted-foreground">
                Purchased {formatDate(item.purchaseDate)}
              </div>
            )}
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {item.notes && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
            {item.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
