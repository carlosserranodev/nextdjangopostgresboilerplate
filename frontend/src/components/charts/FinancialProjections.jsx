'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine} from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import Card from '../ui/Card'
import { useState, useEffect } from 'react'

export default function FinancialProjections() {
  const transactions = useTransactionStore((state) => state.transactions || [])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (transactions.length > 0) {
      // Obtener datos históricos
      const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const amount = parseFloat(transaction.amount)

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            ingresos: 0,
            gastos: 0,
            balance: 0,
            isProjection: false
          }
        }

        if (amount > 0) {
          acc[monthKey].gastos += amount
        } else {
          acc[monthKey].ingresos += Math.abs(amount)
        }

        acc[monthKey].balance = acc[monthKey].ingresos - acc[monthKey].gastos
        return acc
      }, {})

      // Calcular promedios para proyecciones
      const values = Object.values(monthlyData)
      const avgIngresos = values.reduce((sum, month) => sum + month.ingresos, 0) / values.length
      const avgGastos = values.reduce((sum, month) => sum + month.gastos, 0) / values.length

      // Generar proyecciones para los próximos 6 meses
      const lastMonth = new Date(Math.max(...transactions.map(t => new Date(t.date))))
      const projectionMonths = []
      
      for (let i = 1; i <= 6; i++) {
        const projDate = new Date(lastMonth)
        projDate.setMonth(lastMonth.getMonth() + i)
        const monthKey = `${projDate.getFullYear()}-${String(projDate.getMonth() + 1).padStart(2, '0')}`
        
        projectionMonths.push({
          month: monthKey,
          ingresos: avgIngresos,
          gastos: avgGastos,
          balance: avgIngresos - avgGastos,
          isProjection: true
        })
      }

      // Combinar datos históricos y proyecciones
      const allData = [...Object.values(monthlyData), ...projectionMonths]
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(month => ({
          ...month,
          month: new Date(month.month + '-01').toLocaleDateString('es-ES', {
            month: 'short',
            year: 'numeric'
          })
        }))

      setChartData(allData)
    }
  }, [transactions])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-gray-900">{label}</p>
            {data.isProjection && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Proyección
              </span>
            )}
          </div>
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
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Proyecciones Financieras</h2>
        <p className="text-sm text-gray-500 mt-1">
          Basado en el historial de los últimos meses
        </p>
      </div>
      
      {chartData.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              
              {/* Líneas históricas (sólidas) */}
              <Line 
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone"
                dataKey="gastos"
                name="Gastos"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500">
            No hay suficientes datos para realizar proyecciones
          </p>
        </div>
      )}
    </Card>
  )
}