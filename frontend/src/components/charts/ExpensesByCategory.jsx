'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import useTransactionStore from '../../store/transactionStore'
import useCategoryStore from '../../store/categoryStore'
import Card from '../ui/Card'

// Colores actualizados para mejor contraste
const COLORS = {
  'Otros': '#4299E1',     // Azul
  'Ocio': '#48BB78',      // Verde
  'Deudas': '#F6AD55',    // Naranja
  'Transporte': '#FC8181', // Rojo claro
  'Comida': '#9F7AEA',    // Púrpura
  'Hogar': '#4FD1C5',     // Turquesa
  'Salud': '#F687B3',     // Rosa
  'Educación': '#68D391'   // Verde claro
}

const defaultColor = '#CBD5E0' // Color por defecto para categorías no mapeadas

export default function ExpensesByCategory() {
  const transactions = useTransactionStore((state) => state.transactions || [])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    console.log('Procesando datos en ExpensesByCategory')
    if (transactions.length > 0) {
      const expenses = transactions.filter(t => parseFloat(t.amount) < 0)
      console.log('Gastos encontrados:', expenses)
    }
  }, [transactions])

  useEffect(() => {
    if (transactions.length > 0) {
      // Filtrar solo los gastos
      const expenses = transactions.filter(transaction => {
        const amount = parseFloat(transaction.amount)
        const isPlaidTransaction = !transaction.plaid_transaction_id?.startsWith('manual_')
        return isPlaidTransaction ? amount > 0 : amount < 0
      })
      
      const categoryTotals = expenses.reduce((acc, transaction) => {
        const category = transaction.categoria_principal || 'Otros'
        const amount = Math.abs(parseFloat(transaction.amount))
        
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += amount
        return acc
      }, {})

      const data = Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value,
          percentage: 0, // Se calculará después
          formattedValue: `$${value.toFixed(2)}`
        }))
        .sort((a, b) => b.value - a.value)

      // Calcular el total y los porcentajes
      const total = data.reduce((sum, item) => sum + item.value, 0)
      data.forEach(item => {
        item.percentage = ((item.value / total) * 100).toFixed(1)
      })

      setChartData(data)
    }
  }, [transactions])

  useEffect(() => {
    console.log('Transactions actualizadas en ExpensesByCategory:', transactions)
  }, [transactions])


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-gray-600">${data.value.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{data.percentage}% del total</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    // Solo mostrar etiquetas para segmentos con más del 5% del total
    if (percent < 0.05) return null

    return (
      <g>
        <path
          d={`M${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
            cy + outerRadius * Math.sin(-midAngle * RADIAN)
          }L${x},${y}`}
          stroke="#666"
          fill="none"
        />
        <text 
          x={x}
          y={y}
          fill="#333333"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="middle"
          className="text-sm font-medium"
        >
          {`${name} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Gastos por Categoría</h2>
      
      {chartData.length > 0 ? (
        <>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name] || defaultColor}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detallada debajo del gráfico */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartData.map((category, index) => (
              <div 
                key={category.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[category.name] || defaultColor }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.percentage}%</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  ${category.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500">
            No hay datos de gastos disponibles
          </p>
        </div>
      )}
    </Card>
  )
}