'use client'

import { useTransactionStore } from '../../store'
import Card from '../ui/Card'

export default function TransactionList({ accountId }) {
  const transactions = useTransactionStore(
    (state) => accountId 
      ? state.getTransactionsByAccount(accountId)
      : state.transactions
  )

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{transaction.description}</h3>
              <p className="text-sm text-gray-600">
                {transaction.merchantName || 'Sin comercio'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
            <div className={`text-lg ${
              transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}