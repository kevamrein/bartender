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
  createHouseholdMember,
  removeHouseholdMember,
  type HouseholdMember,
} from '@/app/actions/household'
import { Trash2 } from 'lucide-react'

interface HouseholdModalProps {
  open: boolean
  onClose: () => void
  members: HouseholdMember[]
  onSuccess: () => void
}

export function HouseholdModal({ open, onClose, members, onSuccess }: HouseholdModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createHouseholdMember(formData)

      if (result.success) {
        onSuccess()
        e.currentTarget.reset()
        setError('')
      } else {
        setError(result.message || 'Failed to create household member')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (
      !confirm(
        "Remove this patron from your bar? They'll keep their own account but lose access to yours."
      )
    )
      return

    try {
      const result = await removeHouseholdMember(memberId)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.message || 'Failed to remove household member')
      }
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🍸 Manage Bar Patrons</DialogTitle>
          <DialogDescription>
            Add fellow bartenders and patrons who can help manage your bar&apos;s inventory.
            They&apos;ll have their own login and full access to pour drinks from your collection!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing members list */}
          {members.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <span>🥂</span> Current Bar Patrons
              </h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-muted/20"
                  >
                    <div>
                      <div className="font-medium">{member.email}</div>
                      {(member.firstName || member.lastName) && (
                        <div className="text-sm text-muted-foreground">
                          {member.firstName} {member.lastName}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      type="button"
                      title="Remove patron from bar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new member form */}
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <span>✨</span> Add New Patron to Your Bar
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patron@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input id="firstName" name="firstName" placeholder="Enter their first name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input id="lastName" name="lastName" placeholder="Enter their last name" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  They&apos;ll use this to log in and access your bar
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding Patron...' : '🍹 Add Patron'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
