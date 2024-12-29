'use client'

import { useState, useEffect } from 'react'
import useTransactionStore from '../../../store/transactionStore'
import Card from '../../../components/ui/Card'
import { useRouter } from 'next/navigation'
import { 
  RiAddLine, 
  RiSubtractLine, 
  RiExchangeLine,
  RiFilterLine,
  RiSearchLine 
} from 'react-icons/ri'

export default function TransactionsPage() {
  const router = useRouter()
  const transactions = useTransactionStore((state) => state.transactions)
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Filtrar transacciones
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || transaction.categoria_principal === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Primero ordenar por fecha
      const dateComparison = new Date(b.date) - new Date(a.date)
      
      // Solo logear cuando las fechas son iguales
      

      if (dateComparison !== 0) return dateComparison

      // Si las fechas son iguales, ordenar por ID
      const aIsManual = a.plaid_transaction_id?.startsWith('manual_')
      const bIsManual = b.plaid_transaction_id?.startsWith('manual_')

      // Si ambas son manuales o ambas no son manuales, usar el ID
      if (aIsManual === bIsManual) {
        return b.id - a.id
      }

      // Si una es manual y la otra no, poner la manual primero
      return aIsManual ? -1 : 1
    })

  // Obtener categorías únicas
  const uniqueCategories = [...new Set(transactions.map(t => t.categoria_principal).filter(Boolean))]

  console.log('Transacciones filtradas:', filteredTransactions.map(t => ({
    id: t.id,
    amount: t.amount,
    type: t.transaction_type,
    isManual: t.plaid_transaction_id?.startsWith('manual_'),
    plaid_id: t.plaid_transaction_id
  })))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transacciones</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/transactions/new?type=income')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RiAddLine />
            <span>Ingreso</span>
          </button>
          <button
            onClick={() => router.push('/transactions/new?type=expense')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RiSubtractLine />
            <span>Gasto</span>
          </button>
          <button
            onClick={() => router.push('/transactions/new?type=transfer')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RiExchangeLine />
            <span>Transferencia</span>
          </button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-64">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const amount = parseFloat(transaction.amount)
                const isPlaidTransaction = !transaction.plaid_transaction_id?.startsWith('manual_')
                
                // Para transacciones de Plaid, invertimos la lógica del signo
                const isExpense = isPlaidTransaction 
                  ? amount > 0  // Plaid: positivo = gasto
                  : amount < 0  // Manual: negativo = gasto
                
                return (
                  <tr 
                    key={transaction.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/transactions/${transaction.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.merchant_name || transaction.description}
                      </div>
                      {transaction.merchant_name && transaction.description && (
                        <div className="text-sm text-gray-500">
                          {transaction.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.categoria_principal && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {transaction.categoria_principal}
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      isExpense ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isExpense ? '-' : '+'}
                      ${Math.abs(amount).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron transacciones</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}