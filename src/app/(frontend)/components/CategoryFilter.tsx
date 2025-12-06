'use client'

import { cn } from '@/lib/utils'
import { Wine, GlassWater, Martini } from 'lucide-react'

type Category = 'all' | 'liquor' | 'mixer' | 'wine'

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
  counts: {
    all: number
    liquor: number
    mixer: number
    wine: number
  }
}

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  const categories: { id: Category; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'All', icon: null, color: 'bg-secondary' },
    { id: 'liquor', label: 'Liquor', icon: <Martini className="w-4 h-4" />, color: 'bg-amber' },
    { id: 'mixer', label: 'Mixers', icon: <GlassWater className="w-4 h-4" />, color: 'bg-cream text-wood-brown' },
    { id: 'wine', label: 'Wine', icon: <Wine className="w-4 h-4" />, color: 'bg-burgundy' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-display font-medium transition-all duration-200',
            selected === cat.id
              ? cn(cat.color, cat.id !== 'mixer' && 'text-white', 'shadow-md')
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          )}
        >
          {cat.icon}
          <span>{cat.label}</span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs',
            selected === cat.id
              ? 'bg-white/20'
              : 'bg-muted'
          )}>
            {counts[cat.id]}
          </span>
        </button>
      ))}
    </div>
  )
}
