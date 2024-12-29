'use client'

import { useEffect } from 'react'
import useAccountStore from '../../store/accountStore'
import Card from '../ui/Card'
import AccountCard from './AccountCard'

export default function AccountList() {
  const { accounts, fetchAccounts } = useAccountStore()

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
      
      {accounts.length === 0 && (
        <Card className="col-span-full p-6 text-center text-gray-500">
          No hay cuentas configuradas
        </Card>
      )}
    </div>
  )
}