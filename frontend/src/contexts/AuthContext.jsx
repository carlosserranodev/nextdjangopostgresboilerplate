'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login as loginService, register as registerService, getCurrentUser, logout as logoutService } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const userData = await loginService(username, password)
      setUser(userData)
      router.push('/(protected)/dashboard')
      return userData
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await logoutService()
    setUser(null)
    router.push('/(public)/login')
  }

  const register = async (userData) => {
    const user = await registerService(userData)
    setUser(user)
    router.push('/(protected)/dashboard')
    return user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
