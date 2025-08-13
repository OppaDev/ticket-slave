'use client'

import { useEffect, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX, Home, LogIn } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  fallback?: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallback,
  redirectTo
}: ProtectedRouteProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { hasAllPermissions, getUserRole, loading: permissionsLoading, permissionsLoaded } = usePermissions()

  useEffect(() => {
    if (!authLoading && !isAuthenticated && redirectTo) {
      window.location.href = redirectTo
    }
  }, [authLoading, isAuthenticated, redirectTo])

  // Show loading state while auth or permissions are loading
  if (authLoading || permissionsLoading || !permissionsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <LogIn className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-900">Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para acceder a esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const userRole = getUserRole()
    if (!userRole || !requiredRoles.includes(userRole)) {
      if (fallback) return <>{fallback}</>
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <ShieldX className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-amber-900">Acceso Denegado</CardTitle>
              <CardDescription>
                No tienes permisos para acceder a esta página. 
                Se requiere rol: {requiredRoles.join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Tu rol actual: <span className="font-semibold">{userRole}</span>
                </p>
              </div>
              <Link href="/events">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Ir a Eventos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    if (!hasAllPermissions(requiredPermissions)) {
      if (fallback) return <>{fallback}</>
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <ShieldX className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-900">Permisos Insuficientes</CardTitle>
              <CardDescription>
                No tienes los permisos necesarios para acceder a esta funcionalidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Permisos requeridos:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {requiredPermissions.map(permission => (
                    <li key={permission} className="font-mono bg-gray-100 p-1 rounded">
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/events">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Ir a Eventos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Component for conditional rendering based on permissions
interface ConditionalRenderProps {
  children: ReactNode
  roles?: string[]
  permissions?: string[]
  fallback?: ReactNode
}

export function ConditionalRender({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null 
}: ConditionalRenderProps) {
  const { getUserRole } = usePermissions()
  const { hasAllPermissions } = usePermissions()

  // Check role access
  if (roles.length > 0) {
    const userRole = getUserRole()
    if (!userRole || !roles.includes(userRole)) {
      return <>{fallback}</>
    }
  }

  // Check permission access
  if (permissions.length > 0) {
    if (!hasAllPermissions(permissions)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
