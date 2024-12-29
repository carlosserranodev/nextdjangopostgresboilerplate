'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import Card from '../ui/Card'


import { useEffect, useState } from 'react'

export default function MonthlyTrends() {
  const transactions = useTransactionStore((state) => state.transactions || [])
  const [chartData, setChartData] = useState([])
  const [totals, setTotals] = useState({ ingresos: 0, gastos: 0 })

  useEffect(() => {
    console.log('Procesando datos en MonthlyTrends')
    if (transactions.length > 0) {
      let totalIngresos = 0
      let totalGastos = 0

      // Agrupar transacciones por mes
      const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const amount = parseFloat(transaction.amount)
        const isPlaidTransaction = !transaction.plaid_transaction_id?.startsWith('manual_')

        // Determinar si es gasto basado en el tipo de transacción
        const isExpense = isPlaidTransaction ? amount > 0 : amount < 0

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            ingresos: 0,
            gastos: 0,
            balance: 0,
            transacciones: 0
          }
        }

        if (isExpense) {
          acc[monthKey].gastos += Math.abs(amount)
          totalGastos += Math.abs(amount)
        } else {
          acc[monthKey].ingresos += Math.abs(amount)
          totalIngresos += Math.abs(amount)
        }

        acc[monthKey].transacciones += 1
        acc[monthKey].balance = acc[monthKey].ingresos - acc[monthKey].gastos

        return acc
      }, {})

      // Convertir a array y ordenar por fecha
      const data = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(month => ({
          ...month,
          month: new Date(month.month + '-01').toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
          })
        }))

      setChartData(data)
      setTotals({ ingresos: totalIngresos, gastos: totalGastos })
    }
    console.log('Procesando datos en MonthlyTrends')
  }, [transactions])

  useEffect(() => {
    console.log('Transactions actualizadas en MonthlyTrends:', transactions)
  }, [transactions])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Ingresos: ${data.ingresos.toFixed(2)}
            </p>
            <p className="text-sm text-red-600">
              Gastos: ${data.gastos.toFixed(2)}
            </p>
            <p className={`text-sm font-medium ${data.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Balance: ${data.balance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Transacciones: {data.transacciones}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Tendencias Mensuales</h2>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600">Total Ingresos</p>
            <p className="text-lg font-semibold text-green-700">
              ${totals.ingresos.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-600">Total Gastos</p>
            <p className="text-lg font-semibold text-red-700">
              ${totals.gastos.toFixed(2)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            totals.ingresos - totals.gastos >= 0 ? 'bg-blue-50' : 'bg-orange-50'
          }`}>
            <p className={`text-sm ${
              totals.ingresos - totals.gastos >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>Balance Total</p>
            <p className={`text-lg font-semibold ${
              totals.ingresos - totals.gastos >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              ${(totals.ingresos - totals.gastos).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {chartData.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#666' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Bar 
                dataKey="ingresos" 
                name="Ingresos" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar 
                dataKey="gastos" 
                name="Gastos" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500">
            No hay datos suficientes para mostrar tendencias
          </p>
        </div>
      )}
    </Card>
  )
}