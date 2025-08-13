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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          setUser(response.data.user || response.data)
        } catch (error) {
          console.error('Failed to get current user:', error)
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
      
      // Redirect based on role
      if (authData.user.role?.nombre === 'admin' || authData.user.role?.nombre === 'organizer') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/events'
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
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
  }) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      const authData: AuthResponse = response.data
      
      setAuthToken(authData.token)
      setUser(authData.user)
      
      // Redirect to events page for new users
      window.location.href = '/events'
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
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
          window.location.href = '/unauthorized'
          return
        }
      }
    }
  }, [user, loading, isAuthenticated, requiredRoles])

  return { user, loading, isAuthenticated }
}