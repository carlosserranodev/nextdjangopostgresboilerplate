'use client'

import CategoryManager from '../../../components/categories/CategoryManager'

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <CategoryManager />
    </div>
  )
}