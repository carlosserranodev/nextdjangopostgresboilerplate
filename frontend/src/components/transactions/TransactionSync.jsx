'use client'

import { useState } from 'react'
import Button from '../../components/ui/Button'
import { useTransactionStore } from '../../store/transactionStore'

export default function TransactionSync({ accessToken }) {
  const { syncTransactions, isLoading, error, lastSync } = useTransactionStore()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Obtener transacciones de los últimos 30 días
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      await syncTransactions(accessToken, startDate, endDate)
    } catch (error) {
      console.error('Error syncing transactions:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {lastSync && (
            <p className="text-sm text-gray-600">
              Última sincronización: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-4"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar transacciones'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}