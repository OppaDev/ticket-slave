'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { usersAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Loader2, User as UserIcon, Mail, Calendar, MapPin, Crown } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types'

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await usersAPI.getUser(userId)
        setUser(response.data)
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Error al cargar los datos del usuario')
        router.push('/dashboard/users')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['users:read']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos del usuario...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute requiredPermissions={['users:read']}>
        <div className="text-center">
          <p>Usuario no encontrado</p>
          <Button onClick={() => router.push('/dashboard/users')} className="mt-4">
            Volver a Usuarios
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredPermissions={['users:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/users')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.nombre} {user.apellido}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Usuario
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Datos básicos del usuario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <p className="text-sm font-medium">{user.nombre} {user.apellido}</p>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.email}
                    </p>
                  </div>
                  
                  {user.fechaNacimiento && (
                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(user.fechaNacimiento)}
                      </p>
                    </div>
                  )}
                  
                  {user.pais && (
                    <div>
                      <Label>País</Label>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {user.pais}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label>Estado</Label>
                    <div>
                      <Badge 
                        variant={user.status === 'activo' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Términos y Condiciones</Label>
                    <p className="text-sm font-medium">
                      {user.aceptaTerminos ? '✅ Aceptados' : '❌ No aceptados'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role & Permissions Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Rol y Permisos
                </CardTitle>
                <CardDescription>
                  Información sobre roles y accesos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.role ? (
                  <>
                    <div>
                      <Label>Rol</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={user.role.nombre === 'admin' ? 'destructive' : 'default'}
                          className="capitalize"
                        >
                          {user.role.nombre}
                        </Badge>
                      </div>
                      {user.role.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">
                          {user.role.descripcion}
                        </p>
                      )}
                    </div>
                    
                    {user.role.permissions && user.role.permissions.length > 0 && (
                      <div>
                        <Label>Permisos ({user.role.permissions.length})</Label>
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                          {user.role.permissions.map((permission: { id: string; nombre: string; descripcion?: string }) => (
                            <div 
                              key={permission.id}
                              className="text-xs bg-gray-50 rounded px-2 py-1"
                            >
                              <span className="font-medium">{permission.nombre}</span>
                              {permission.descripcion && (
                                <div className="text-gray-600 mt-1">
                                  {permission.descripcion}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Sin rol asignado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timestamps Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>
              Fechas importantes y metadatos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Fecha de Registro</Label>
                <p className="text-sm font-medium">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>
              
              {user.updatedAt && (
                <div>
                  <Label>Última Actualización</Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(user.updatedAt)}
                  </p>
                </div>
              )}
              
              {user.lastLoginAt && (
                <div>
                  <Label>Último Acceso</Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(user.lastLoginAt)}
                  </p>
                </div>
              )}
              
              <div>
                <Label>ID del Usuario</Label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {user.id}
                </p>
              </div>
              
              {user.roleId && (
                <div>
                  <Label>ID del Rol</Label>
                  <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                    {user.roleId}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

// Helper component for labels
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}
