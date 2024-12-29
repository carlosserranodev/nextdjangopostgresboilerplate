'use client'

import { useState, useEffect } from 'react'
import useTransactionStore from '../../store/transactionStore'
import Card from '../ui/Card'
import Link from 'next/link'

export default function RecentTransactions() {
  const transactions = useTransactionStore((state) => state.transactions)
  const [sortedTransactions, setSortedTransactions] = useState([])

  useEffect(() => {
    if (transactions?.length > 0) {
      const sorted = transactions
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
        .slice(0, 5)
        .map(transaction => ({
          ...transaction,
          type: transaction.transaction_type,
          amount: transaction.transaction_type === 'expense' 
            ? -Math.abs(parseFloat(transaction.amount))
            : Math.abs(parseFloat(transaction.amount))
        }))
      
      console.log('Actualizando sorted transactions:', sorted)
      setSortedTransactions(sorted)
    }
  }, [transactions])

  const formatTransactionName = (transaction) => {
    if (transaction.merchant_name) {
      return transaction.merchant_name
    }
    return transaction.name || 'Transacción sin nombre'
  }

  useEffect(() => {
    console.log('Procesando datos en RecentTransactions')
    console.log('Transacciones ordenadas:', 
      transactions?.slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    )
  }, [transactions])

  console.log('Renderizando RecentTransactions con:', {
    transactionsLength: transactions?.length,
    firstTransaction: transactions?.[0],
    lastTransaction: transactions?.[transactions?.length - 1]
  })

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Últimas Transacciones</h2>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-700 text-sm">
          Ver todas
        </Link>
      </div>

      <div className="space-y-4">
        {sortedTransactions.map(transaction => (
          <div 
            key={transaction.id}
            className="flex justify-between items-center py-2 border-b last:border-0"
          >
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium">
                  {formatTransactionName(transaction)}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
                {transaction.categoria_principal && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {transaction.categoria_principal}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`font-medium ${
                transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.amount < 0 ? '-' : '+'}
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
              {transaction.name && transaction.merchant_name && 
               transaction.name !== transaction.merchant_name && (
                <p className="text-xs text-gray-500 mt-1">
                  {transaction.name}
                </p>
              )}
            </div>
          </div>
        ))}

        {sortedTransactions.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500">No hay transacciones recientes</p>
            <p className="text-sm text-gray-400 mt-1">
              Las transacciones aparecerán aquí cuando las registres
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}