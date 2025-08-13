'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Loader2, Crown, Shield, Users as UsersIcon, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/types'

const roleIcons = {
  admin: Crown,
  organizer: UsersIcon,
  customer: Settings,
}

const roleColors = {
  admin: 'text-purple-600 bg-purple-50 border-purple-200',
  organizer: 'text-blue-600 bg-blue-50 border-blue-200', 
  customer: 'text-green-600 bg-green-50 border-green-200',
}

export default function RoleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role | null>(null)

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true)
        const response = await rbacAPI.getRole(roleId)
        setRole(response.data)
      } catch (error) {
        console.error('Error fetching role:', error)
        toast.error('Error al cargar los datos del rol')
        router.push('/dashboard/roles')
      } finally {
        setLoading(false)
      }
    }

    if (roleId) {
      fetchRole()
    }
  }, [roleId, router])

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
      <ProtectedRoute requiredPermissions={['rbac:manage']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos del rol...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!role) {
    return (
      <ProtectedRoute requiredPermissions={['rbac:manage']}>
        <div className="text-center">
          <p>Rol no encontrado</p>
          <Button onClick={() => router.push('/dashboard/roles')} className="mt-4">
            Volver a Roles
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const Icon = roleIcons[role.nombre as keyof typeof roleIcons] || Crown
  const colorClass = roleColors[role.nombre as keyof typeof roleColors] || roleColors.customer

  return (
    <ProtectedRoute requiredPermissions={['rbac:manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/roles')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {role.nombre}
                </h1>
                <p className="text-gray-600">{role.descripcion}</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Rol
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Información del Rol
                </CardTitle>
                <CardDescription>
                  Datos básicos y descripción del rol
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Rol</Label>
                    <p className="text-sm font-medium capitalize">{role.nombre}</p>
                  </div>
                  
                  <div>
                    <Label>Descripción</Label>
                    <p className="text-sm font-medium">
                      {role.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Fecha de Creación</Label>
                    <p className="text-sm font-medium">
                      {formatDateTime(role.createdAt)}
                    </p>
                  </div>
                  
                  {role.updatedAt && (
                    <div>
                      <Label>Última Actualización</Label>
                      <p className="text-sm font-medium">
                        {formatDateTime(role.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Permissions Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5" />
                    <Label>Permisos Asignados ({role.permissions?.length || 0})</Label>
                  </div>
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {role.permissions.map((permission) => (
                        <div 
                          key={permission.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="font-medium text-sm">{permission.nombre}</div>
                          {permission.descripcion && (
                            <div className="text-xs text-gray-600 mt-1">
                              {permission.descripcion}
                            </div>
                          )}
                          {permission.module && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {permission.module}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Sin permisos asignados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users with this Role */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Usuarios con este Rol
                </CardTitle>
                <CardDescription>
                  Lista de usuarios asignados a este rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {role.users && role.users.length > 0 ? (
                  <div className="space-y-3">
                    {role.users.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {user.nombre} {user.apellido}
                          </div>
                          <div className="text-xs text-gray-600">
                            {user.email}
                          </div>
                        </div>
                        <Badge 
                          variant={user.status === 'activo' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UsersIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Sin usuarios asignados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>
              Metadatos y detalles técnicos del rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>ID del Rol</Label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {role.id}
                </p>
              </div>
              
              <div>
                <Label>Total de Permisos</Label>
                <p className="text-sm font-medium">
                  {role.permissions?.length || 0} permisos asignados
                </p>
              </div>
              
              <div>
                <Label>Total de Usuarios</Label>
                <p className="text-sm font-medium">
                  {role.users?.length || 0} usuarios con este rol
                </p>
              </div>
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
