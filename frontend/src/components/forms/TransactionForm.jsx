'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useTransactionStore from '../../store/transactionStore'
import useAccountStore from '../../store/accountStore'
import Card from '../ui/Card'
import transactionService from '../../services/transactionService'

const CATEGORIES = {
  expense: [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Ocio',
    'Salud',
    'Educación',
    'Otros'
  ],
  income: [
    'Salario',
    'Inversiones',
    'Ventas',
    'Regalos',
    'Otros'
  ]
}

export default function TransactionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'expense'
  const { accounts } = useAccountStore()
  const { addTransaction, fetchTransactions } = useTransactionStore()

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    accountId: '',
    toAccountId: '' // Solo para transferencias
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }))
    }
  }, [accounts, formData.accountId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('El monto debe ser un número positivo')
      }

      // Ajustar el monto según el tipo
      // Los ingresos son positivos y los gastos negativos
      const adjustedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount)
       // Formatear la fecha como YYYY-MM-DD
       const formattedDate = formData.date.split('T')[0]

      const transaction = {
        account: formData.accountId,  // ID de la cuenta
        name: formData.description,   // Usar description como name
        amount: adjustedAmount,
        date: formattedDate,
        transaction_type: type,
        categoria_principal: formData.category,
        categoria_personalizada: formData.category || '',
        payment_channel: 'online',
        plaid_transaction_id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,  // ID único temporal
        merchant_name: formData.description || '',
        website: '',
        iso_currency_code: 'EUR'
      }

      console.log('Datos enviados al backend:', transaction)

      // Usar el servicio para crear la transacción
      const savedTransaction = await transactionService.createTransaction(transaction)
      console.log('Respuesta completa del backend:', savedTransaction)
      console.log('Llamando a addTransaction...')
      await addTransaction(savedTransaction)
      console.log('addTransaction completado')
      
      // Añadir un pequeño delay antes de la redirección
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/dashboard')
    } catch (err) {
      console.error('Error completo:', err.response?.data || err)
      // Mostrar errores de una forma más amigable
      if (err.response?.data) {
        const errorMessages = Object.entries(err.response.data)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n')
        setError(errorMessages)
      } else {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto bg-white shadow-lg">
      <div className={`mb-8 flex items-center ${
        type === 'income' ? 'text-green-600' :
        type === 'expense' ? 'text-red-600' :
        'text-blue-600'
      }`}>
        <h2 className="text-2xl font-bold">
          {type === 'income' ? '💰 Nuevo Ingreso' : 
           type === 'expense' ? '💸 Nuevo Gasto' : 
           '↔️ Nueva Transferencia'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monto */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-700"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Fecha */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-600 placeholder-gray-400"
              placeholder="Selecciona una fecha"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción
          </label>
          <input
            type="text"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="¿En qué gastaste?"
          />
        </div>

        {/* Cuenta */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cuenta
          </label>
          <select
            name="accountId"
            required
            value={formData.accountId}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-600"
          >
            <option key="default-account" value="" className="text-gray-400">Seleccionar cuenta</option>
            {accounts.map((account, index) => (
              <option key={`account-${account.id}-${index}`} value={account.id}>
                {account.name} (${parseFloat(account.balance || 0).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-600"
            >
              <option key="default-category" value="" className="text-gray-400">Seleccionar categoría</option>
              {CATEGORIES[type].map((category, index) => (
                <option key={`category-${type}-${index}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cuenta destino */}
        {type === 'transfer' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cuenta destino
            </label>
            <select
              name="toAccountId"
              required
              value={formData.toAccountId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option key="default-destination" value="" className="text-gray-400">Seleccionar cuenta destino</option>
              {accounts
                .filter(account => account.id !== formData.accountId)
                .map((account, index) => (
                  <option key={`destination-${account.id}-${index}`} value={account.id}>
                    {account.name} (${parseFloat(account.balance || 0).toFixed(2)})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors
              ${type === 'income' 
                ? 'bg-green-600 hover:bg-green-700' 
                : type === 'expense'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Card>
  )
}