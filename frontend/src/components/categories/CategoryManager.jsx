'use client'

import { useState } from 'react'
import useCategoryStore from '../../store/categoryStore'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function CategoryManager() {
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    type: 'expense'
  })
  
  const { categories, addCategory, deleteCategory } = useCategoryStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newCategory.name && newCategory.icon) {
      addCategory(newCategory)
      setNewCategory({ name: '', icon: '', type: 'expense' })
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestionar Categorías</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Icono
          </label>
          <input
            type="text"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="🏠"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={newCategory.type}
            onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
        </div>
        
        <Button type="submit" className="w-full">
          Añadir Categoría
        </Button>
      </form>

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{category.icon}</span>
              <span>{category.name}</span>
              <span className="text-sm text-gray-500">
                ({category.type === 'expense' ? 'Gasto' : 'Ingreso'})
              </span>
            </div>
            <button
              onClick={() => deleteCategory(category.id)}
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}