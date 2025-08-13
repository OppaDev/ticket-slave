'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { setAuthToken } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Crown, Users, ShoppingCart, Zap, Eye, EyeOff } from 'lucide-react'

interface DevUser {
  role: 'admin' | 'organizer' | 'customer'
  email: string
  token: string
}

const DEV_USERS: DevUser[] = [
  {
    role: 'admin',
    email: 'admin@test.com',
    token: process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN || '',
  },
  {
    role: 'organizer', 
    email: 'organizer@test.com',
    token: process.env.NEXT_PUBLIC_DEV_ORGANIZER_TOKEN || '',
  },
  {
    role: 'customer',
    email: 'customer@test.com', 
    token: process.env.NEXT_PUBLIC_DEV_CUSTOMER_TOKEN || '',
  },
]

const roleConfig = {
  admin: {
    icon: Crown,
    color: 'bg-purple-500',
    description: 'Acceso total al sistema',
    badge: 'destructive' as const,
  },
  organizer: {
    icon: Users,
    color: 'bg-blue-500',
    description: 'Gestiona eventos y tickets',
    badge: 'default' as const,
  },
  customer: {
    icon: ShoppingCart,
    color: 'bg-green-500',
    description: 'Compra tickets y eventos',
    badge: 'secondary' as const,
  },
}

export function DevLoginPanel() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [showTokens, setShowTokens] = useState(false)

  // Only show in development mode
  if (process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    return null
  }

  const handleQuickLogin = async (role: 'admin' | 'organizer' | 'customer') => {
    try {
      setLoading(role)
      
      const userData = DEV_USERS.find(u => u.role === role)
      if (!userData?.token) {
        toast.error(`Token de ${role} no disponible`)
        return
      }

      // Set token and mock user data (ya que no hay /auth/me)
      setAuthToken(userData.token)
      
      // Mock user data para localStorage
      const mockUser = {
        id: role === 'admin' ? '1' : role === 'organizer' ? '2' : '3',
        nombre: role.charAt(0).toUpperCase() + role.slice(1),
        apellido: 'User',
        email: userData.email,
        role: { nombre: role }
      }
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      
      toast.success(`¡Sesión iniciada como ${role}!`)
      
      // Redirect based on role
      if (role === 'admin' || role === 'organizer') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/events'
      }
    } catch (error) {
      console.error('Quick login failed:', error)
      toast.error(`Error al iniciar sesión como ${role}`)
    } finally {
      setLoading(null)
    }
  }

  if (user) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">Modo Desarrollo</CardTitle>
          </div>
          <CardDescription className="text-yellow-700">
            Sesión activa como <Badge variant={roleConfig[user.role?.nombre as keyof typeof roleConfig]?.badge}>{user.role?.nombre}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">Quick Login - Desarrollo</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTokens(!showTokens)}
            className="text-blue-600"
          >
            {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Inicia sesión rápidamente con usuarios predefinidos para testing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {DEV_USERS.map((devUser) => {
          const config = roleConfig[devUser.role]
          const Icon = config.icon
          
          return (
            <div key={devUser.role} className="space-y-2">
              <Button
                onClick={() => handleQuickLogin(devUser.role)}
                disabled={loading !== null}
                className="w-full justify-start gap-3 h-auto p-4"
                variant="outline"
              >
                <div className={`p-2 rounded ${config.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium capitalize">
                    {devUser.role}
                    <Badge variant={config.badge} className="ml-2 capitalize">
                      {devUser.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {devUser.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                {loading === devUser.role && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                )}
              </Button>
              
              {showTokens && (
                <div className="ml-4 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                  <div className="text-gray-600 mb-1">Token:</div>
                  <div className="text-gray-800">{devUser.token || 'No disponible'}</div>
                </div>
              )}
            </div>
          )
        })}
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
          <div className="text-sm text-amber-800">
            <strong>⚠️ Solo Desarrollo:</strong> Este panel solo aparece en modo desarrollo.
            Los tokens están preconfigurados para usuarios de prueba.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
