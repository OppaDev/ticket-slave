'use client'

import { useState, useEffect, useCallback, useContext } from 'react'
import { authAPI, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api'
import { AuthContext } from '@/lib/auth-context'
import type { User, AuthResponse } from '@/types'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Check user roles
  const isAdmin = user?.role?.nombre === 'admin'
  const isOrganizer = user?.role?.nombre === 'organizer'
  const isCustomer = user?.role?.nombre === 'customer'

  // Initialize auth state - SIN /api/v1/auth/me ya que NO existe en el HAR
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          // Como no hay endpoint /auth/me, guardamos datos del usuario en localStorage durante login
          const userData = localStorage.getItem('user_data')
          if (userData) {
            setUser(JSON.parse(userData))
          } else {
            // Si no hay datos guardados, removemos el token inválido
            removeAuthToken()
          }
        } catch (error) {
          console.error('Failed to get user data from storage:', error)
          removeAuthToken()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      const authData: AuthResponse = response.data
      
      setAuthToken(authData.token)
      setUser(authData.user)
      
      // Guardar datos del usuario en localStorage para persistir sin /auth/me
      localStorage.setItem('user_data', JSON.stringify(authData.user))
      
      // Redirect based on role
      const userRole = authData.user.role?.nombre
      switch (userRole) {
        case 'admin':
          window.location.href = '/dashboard' // Dashboard administrativo
          break
        case 'organizer':
          window.location.href = '/organizer/events' // Dashboard del organizador
          break
        case 'customer':
        default:
          window.location.href = '/events' // Vista pública de eventos
          break
      }
    } catch (error) {
      console.error('Login failed:', error)
      const message = error instanceof Error ? error.message : 'Login failed'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Register function
  const register = useCallback(async (userData: { 
    nombre: string
    apellido: string
    email: string
    password: string 
    roleId: string
    fechaNacimiento: string
    pais: string
    aceptaTerminos: boolean
  }) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      const authData: AuthResponse = response.data
      
      setAuthToken(authData.token)
      setUser(authData.user)
      
      // Guardar datos del usuario en localStorage para persistir sin /auth/me
      localStorage.setItem('user_data', JSON.stringify(authData.user))
      
      // Redirect to events page for new users
      window.location.href = '/events'
    } catch (error) {
      console.error('Registration failed:', error)
      const message = error instanceof Error ? error.message : 'Registration failed'
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      removeAuthToken()
      localStorage.removeItem('user_data') // Limpiar datos del usuario también
      setUser(null)
      window.location.href = '/login'
    }
  }, [])

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isCustomer,
  }
}


// Hook for protected routes
export function useProtectedRoute(requiredRoles?: string[]) {
  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        window.location.href = '/login'
        return
      }

      if (requiredRoles && user?.role?.nombre) {
        if (!requiredRoles.includes(user.role.nombre)) {
          // Redirigir a la página apropiada según el rol del usuario
          const userRole = user.role.nombre
          switch (userRole) {
            case 'admin':
              window.location.href = '/dashboard'
              break
            case 'organizer':
              window.location.href = '/organizer/events'
              break
            case 'customer':
            default:
              window.location.href = '/events'
              break
          }
          return
        }
      }
    }
  }, [user, loading, isAuthenticated, requiredRoles])

  return { user, loading, isAuthenticated }
}