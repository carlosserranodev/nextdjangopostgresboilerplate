'use client'

import { useEffect, useState } from 'react'
import PlaidLink from '../../../components/banking/PlaidLink'
import Card from '../../../components/ui/Card'
import { useAccountStore } from '../../../store'
import Button from '../../../components/ui/Button'
import AccountList from '../../../components/accounts/AccountList'
import AccountForm from '../../../components/accounts/AccountForm'

export default function AccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona tus cuentas bancarias y manuales
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="w-full sm:w-auto"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Añadir Cuenta Manual
              </span>
            </Button>
            <PlaidLink className="w-full sm:w-auto" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total en Cuentas</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">$0.00</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Cuentas Activas</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Última Sincronización</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">--:--</p>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Tus Cuentas</h2>
        <AccountList />
      </div>

      {/* Account Form Modal */}
      {isFormOpen && (
        <AccountForm 
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false)
          }}
        />
      )}
    </div>
  )
}