'use client'

import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Card from '../../../components/ui/Card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      await login(formData.username, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Usuario"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="text-center">
          <Link 
            href="/register" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </Card>
    </div>
  )
}