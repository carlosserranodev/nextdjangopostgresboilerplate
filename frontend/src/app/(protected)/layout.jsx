'use client'

import { useAuth } from '../../contexts/AuthContext'
import { redirect } from 'next/navigation'
import Sidebar from '../../components/navigation/Sidebar'

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}