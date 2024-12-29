'use client'

import { useState } from 'react'
import useCategoryStore from '../../store/categoryStore'

export default function CategorySelect({ value, onChange, type = 'expense' }) {
  const categories = useCategoryStore((state) => 
    state.categories.filter(cat => cat.type === type)
  )

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`p-3 rounded-lg border text-center transition-colors ${
            value === category.id
              ? 'bg-blue-50 border-blue-500'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="text-2xl mb-1 block">{category.icon}</span>
          <span className="text-sm">{category.name}</span>
        </button>
      ))}
    </div>
  )
}