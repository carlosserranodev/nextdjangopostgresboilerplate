'use client'

import { useState } from 'react'
import useAccountStore from '../../store/accountStore'
import Card from '../ui/Card'
import Button from '../ui/Button'
import AccountForm from './AccountForm'

export default function AccountCard({ account }) {
  const [isEditing, setIsEditing] = useState(false)
  const { removeAccount } = useAccountStore()

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
      await removeAccount(account.id)
    }
  }

  // Convertir el balance a número y formatear
  const formattedBalance = parseFloat(account.balance).toFixed(2)

  // Función para obtener el nombre del tipo de cuenta en español
  const getAccountTypeName = (type) => {
    const types = {
      'checking': 'Cuenta Corriente',
      'savings': 'Cuenta de Ahorro',
      'credit': 'Tarjeta de Crédito',
      'investment': 'Cuenta de Inversión'
    }
    return types[type] || type
  }

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-600">{getAccountTypeName(account.type)}</p>
          </div>
          <div className="space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Eliminar
              </span>
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">
            ${formattedBalance}
          </p>
        </div>
      </Card>

      {isEditing && (
        <AccountForm
          account={account}
          onClose={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      )}
    </>
  )
}