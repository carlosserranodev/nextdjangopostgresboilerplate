'use client'

import { useEffect } from 'react'
import useTransactionStore from '../../../store/transactionStore'
import useAccountStore from '../../../store/accountStore'
import BalanceSummary from '../../../components/dashboard/BalanceSummary.jsx'
import QuickActions from '../../../components/dashboard/QuickActions.jsx'
import RecentTransactions from '../../../components/dashboard/RecentTransactions.jsx'
import ExpensesByCategory from '../../../components/charts/ExpensesByCategory.jsx'
import MonthlyTrends from '../../../components/charts/MonthlyTrends.jsx'
import FinancialProjections from '../../../components/charts/FinancialProjections.jsx'

export default function DashboardPage() {
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts)
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions)

  useEffect(() => {
    let isSubscribed = true

    const loadData = async () => {
      if (isSubscribed) {
        await Promise.all([
          fetchAccounts(),
          fetchTransactions()
        ])
      }
    }

    loadData()

    return () => {
      isSubscribed = false
    }
  }, [fetchAccounts, fetchTransactions])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">¡Hola! 👋 Aqui tienes tu Dashboard financiero 📊</h1>
      
      <BalanceSummary />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActions />
        <RecentTransactions />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpensesByCategory />
        <MonthlyTrends />
      </div>

      <FinancialProjections />
    </div>
  )
}

//<div className="grid grid-cols-2 gap-6">
//      <div className="col-span-1 bg-white rounded-lg shadow p-6">
//        <h2 className="text-xl font-semibold mb-4">Gastos por Categoría</h2>
//        {/* Aquí irá el gráfico circular */}
//      </div>
//      <div className="col-span-1 bg-white rounded-lg shadow p-6">
//        <h2 className="text-xl font-semibold mb-4">Top Comercios por Gasto</h2>
//        Aquí irá el gráfico de barras


