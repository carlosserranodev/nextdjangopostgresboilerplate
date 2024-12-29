'use client'

import { useState } from 'react'
import useAccountStore from '../../store/accountStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function AccountForm({ account, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || 'checking',
    balance: account?.balance || 0,
  })

  const { addAccount, updateAccount } = useAccountStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (account) {
        await updateAccount(account.id, formData)
      } else {
        await addAccount(formData)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error al guardar la cuenta:', error)
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">
          {account ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="checking">Cuenta Corriente</option>
            <option value="savings">Cuenta de Ahorro</option>
            <option value="credit">Tarjeta de Crédito</option>
            <option value="investment">Cuenta de Inversión</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Saldo
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {account ? 'Guardar Cambios' : 'Crear Cuenta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}