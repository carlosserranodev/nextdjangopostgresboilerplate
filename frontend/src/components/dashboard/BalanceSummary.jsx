'use client'

import { useState, useEffect } from 'react'
import useAccountStore from '../../store/accountStore'
import useTransactionStore from '../../store/transactionStore'
import Card from '../ui/Card'

export default function BalanceSummary() {
  const { allAccounts, totalBalance } = useAccountStore()
  const { transactions } = useTransactionStore()
  const [stats, setStats] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    percentageChange: 0
  })

  useEffect(() => {
    if (transactions.length > 0) {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const monthlyTransactions = transactions.filter(t => new Date(t.date) >= firstDayOfMonth)
      
      const income = monthlyTransactions
        .filter(t => parseFloat(t.amount) > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      
      const expenses = monthlyTransactions
        .filter(t => parseFloat(t.amount) < 0)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

      // Calcular el cambio porcentual (ejemplo simple)
      const percentageChange = totalBalance > 0 ? ((income - expenses) / totalBalance) * 100 : 0

      setStats({
        monthlyIncome: income,
        monthlyExpenses: expenses,
        percentageChange: percentageChange
      })
    }
  }, [transactions, totalBalance])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Balance</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          ${totalBalance.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-green-600">
          +{stats.percentageChange.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Ingresos del Mes</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          ${stats.monthlyIncome.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-green-600">
          +3.2%
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Gastos del Mes</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          ${stats.monthlyExpenses.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-red-600">
          +8.1%
        </p>
      </div>
    </div>
  )
}