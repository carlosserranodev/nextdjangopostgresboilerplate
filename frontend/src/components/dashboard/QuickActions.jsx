'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  RiAddLine, 
  RiSubtractLine, 
  RiExchangeLine 
} from 'react-icons/ri'
import Card from '../ui/Card'
import useTransactionStore from '../../store/transactionStore'
import useAccountStore from '../../store/accountStore'

export default function QuickActions() {
  const router = useRouter()
  const { accounts } = useAccountStore()
  const { addTransaction } = useTransactionStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickAction = async (type) => {
    if (accounts.length === 0) {
      // Si no hay cuentas, redirigir a la página de cuentas
      router.push('/accounts')
      return
    }

    // Si hay cuentas, redirigir al formulario correspondiente
    switch(type) {
      case 'income':
        router.push('/transactions/new?type=income')
        break
      case 'expense':
        router.push('/transactions/new?type=expense')
        break
      case 'transfer':
        router.push('/transactions/new?type=transfer')
        break
      default:
        break
    }
  }

  return (
    <Card className="p-6">
      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={() => handleQuickAction('income')}
          className="flex flex-col items-center p-4 hover:bg-green-50 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-2">
            <RiAddLine className="text-2xl text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Añadir Ingreso</span>
          <span className="text-xs text-gray-500 mt-1">Registrar entrada</span>
        </button>

        <button 
          onClick={() => handleQuickAction('expense')}
          className="flex flex-col items-center p-4 hover:bg-red-50 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-2">
            <RiSubtractLine className="text-2xl text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Añadir Gasto</span>
          <span className="text-xs text-gray-500 mt-1">Registrar salida</span>
        </button>

        <button 
          onClick={() => handleQuickAction('transfer')}
          className="flex flex-col items-center p-4 hover:bg-blue-50 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-2">
            <RiExchangeLine className="text-2xl text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Transferencia</span>
          <span className="text-xs text-gray-500 mt-1">Entre cuentas</span>
        </button>
      </div>
    </Card>
  )
}