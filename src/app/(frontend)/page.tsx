'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from './components/Header'
import { CategoryFilter } from './components/CategoryFilter'
import { InventoryCard } from './components/InventoryCard'
import { AddItemModal } from './components/AddItemModal'
import { AccountSelector } from './components/AccountSelector'
import { HouseholdModal } from './components/HouseholdModal'
import { AIChatButton } from './components/AIChatModal'
import { Button } from '@/components/ui/Button'
import { getInventoryItems, deleteInventoryItem, type InventoryItem } from '@/app/actions/inventory'
import { getHouseholdMembers, type HouseholdMember } from '@/app/actions/household'
import { Plus, Wine, Loader2, Users } from 'lucide-react'

type Category = 'all' | 'liquor' | 'mixer' | 'wine'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [activeAccountId, setActiveAccountId] = useState(session?.user?.id || '')
  const [showHouseholdModal, setShowHouseholdModal] = useState(false)
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([])

  // Update activeAccountId when session loads
  useEffect(() => {
    if (session?.user?.id && !activeAccountId) {
      setActiveAccountId(session.user.id)
    }
  }, [session?.user?.id, activeAccountId])

  const loadItems = useCallback(async () => {
    if (!activeAccountId) return

    try {
      const data = await getInventoryItems(activeAccountId)
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }, [activeAccountId])

  const loadHouseholdMembers = useCallback(async () => {
    try {
      const members = await getHouseholdMembers()
      setHouseholdMembers(members)
    } catch (error) {
      console.error('Error loading household members:', error)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleAccountChange = (accountId: string) => {
    setActiveAccountId(accountId)
  }

  const filteredItems = items.filter(
    (item) => category === 'all' || item.category === category
  )

  const counts = {
    all: items.length,
    liquor: items.filter((i) => i.category === 'liquor').length,
    mixer: items.filter((i) => i.category === 'mixer').length,
    wine: items.filter((i) => i.category === 'wine').length,
  }

  const handleDelete = async (id: string) => {
    const result = await deleteInventoryItem(id, activeAccountId)
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleOpenHouseholdModal = () => {
    loadHouseholdMembers()
    setShowHouseholdModal(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setEditingItem(null)
  }

  const handleSuccess = (updatedItem?: InventoryItem) => {
    if (updatedItem && editingItem) {
      // Optimistically update the edited item in state
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      )
    } else {
      // Reload all items for new additions (to get server-generated ID)
      loadItems()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                Welcome back
                {session?.user?.accessibleAccounts &&
                  activeAccountId &&
                  (() => {
                    const activeAccount = session.user.accessibleAccounts.find(
                      (acc) => acc.id === activeAccountId
                    )
                    return activeAccount ? `, ${activeAccount.name}` : ''
                  })()}
              </h1>
              <p className="text-muted-foreground text-lg">
                Your personal bar inventory at a glance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {session?.user?.accessibleAccounts && (
                <AccountSelector
                  accessibleAccounts={session.user.accessibleAccounts}
                  activeAccountId={activeAccountId}
                  onAccountChange={handleAccountChange}
                />
              )}
              <Button variant="outline" onClick={handleOpenHouseholdModal}>
                <Users className="w-4 h-4 mr-2" />
                🍸 My Bar Patrons
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Items" value={counts.all} />
          <StatCard label="Liquors" value={counts.liquor} color="amber" />
          <StatCard label="Mixers" value={counts.mixer} color="cream" />
          <StatCard label="Wines" value={counts.wine} color="burgundy" />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <CategoryFilter
            selected={category}
            onChange={setCategory}
            counts={counts}
          />
          <Button onClick={() => setShowAddModal(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState category={category} onAdd={() => setShowAddModal(true)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AddItemModal
        open={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        editItem={editingItem}
        activeAccountId={activeAccountId}
      />

      {/* Household Modal */}
      <HouseholdModal
        open={showHouseholdModal}
        onClose={() => setShowHouseholdModal(false)}
        members={householdMembers}
        onSuccess={loadHouseholdMembers}
      />

      {/* AI Chat Button */}
      <AIChatButton activeAccountId={activeAccountId} />
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: 'amber' | 'cream' | 'burgundy'
}) {
  const colorClasses = {
    amber: 'text-amber',
    cream: 'text-wood-brown',
    burgundy: 'text-burgundy',
  }

  return (
    <div className="vintage-card text-center">
      <div
        className={`text-3xl font-display font-bold ${
          color ? colorClasses[color] : 'text-primary'
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  )
}

function EmptyState({
  category,
  onAdd,
}: {
  category: Category
  onAdd: () => void
}) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Wine className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl font-semibold mb-2">
        {category === 'all'
          ? 'Your bar is empty'
          : `No ${category} items yet`}
      </h2>
      <p className="text-muted-foreground mb-6">
        Start building your collection by adding your first item
      </p>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Item
      </Button>
    </div>
  )
}
