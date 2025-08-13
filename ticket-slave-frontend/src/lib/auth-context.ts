import { createContext } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: { nombre: string; apellido: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isOrganizer: boolean
  isCustomer: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)