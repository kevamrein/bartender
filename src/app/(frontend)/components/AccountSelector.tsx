'use client'

import { type AccountAccess } from '@/lib/account-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

interface AccountSelectorProps {
  accessibleAccounts: AccountAccess[]
  activeAccountId: string
  onAccountChange: (accountId: string) => void
}

export function AccountSelector({
  accessibleAccounts,
  activeAccountId,
  onAccountChange,
}: AccountSelectorProps) {
  // Only show selector if user has access to more than 1 account
  if (!accessibleAccounts || accessibleAccounts.length <= 1) {
    return null
  }

  const activeAccount = accessibleAccounts.find((acc) => acc.id === activeAccountId)

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">🍷 Bar:</span>
      <Select value={activeAccountId} onValueChange={onAccountChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>{activeAccount?.name ? `${activeAccount.name}'s Bar` : 'Select bar'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accessibleAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex flex-col">
                <span className="font-medium">🍸 {account.name}&apos;s Bar</span>
                <span className="text-xs text-muted-foreground">{account.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
