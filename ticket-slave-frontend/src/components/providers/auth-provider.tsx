'use client'

import { ReactNode } from 'react'
import { useAuthProvider } from '@/hooks/use-auth'
import { AuthContext } from '@/lib/auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}