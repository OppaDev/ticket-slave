'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Loader2, Shield, Users, Settings, Crown, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Permission } from '@/types'

const moduleIcons = {
  'users': Users,
  'events': Shield,
  'tickets': ShoppingCart,
  'rbac': Crown,
  'general': Settings
} as const

const moduleColors = {
  'users': 'text-blue-600 bg-blue-50 border-blue-200',
  'events': 'text-green-600 bg-green-50 border-green-200',
  'tickets': 'text-purple-600 bg-purple-50 border-purple-200',
  'rbac': 'text-red-600 bg-red-50 border-red-200',
  'general': 'text-gray-600 bg-gray-50 border-gray-200',
} as const

export default function PermissionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const permissionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState<Permission | null>(null)

  // Fetch permission data
  useEffect(() => {
    const fetchPermission = async () => {
      try {
        setLoading(true)
        const response = await rbacAPI.getPermission(permissionId)
        setPermission(response.data)
      } catch (error) {
        console.error('Error fetching permission:', error)
        toast.error('Error al cargar los datos del permiso')
        router.push('/dashboard/permissions')
      } finally {
        setLoading(false)
      }
    }

    if (permissionId) {
      fetchPermission()
    }
  }, [permissionId, router])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Extract module and action from permission name
  const getPermissionModule = (permissionName: string): string => {
    const parts = permissionName.split(':')
    return parts[0] || 'general'
  }

  const getPermissionAction = (permissionName: string): string => {
    const parts = permissionName.split(':')
    return parts[1] || 'manage'
  }

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['rbac:manage']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos del permiso...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!permission) {
    return (
      <ProtectedRoute requiredPermissions={['rbac:manage']}>
        <div className="text-center">
          <p>Permiso no encontrado</p>
          <Button onClick={() => router.push('/dashboard/permissions')} className="mt-4">
            Volver a Permisos
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const permissionModule = getPermissionModule(permission.nombre)
  const action = getPermissionAction(permission.nombre)
  const Icon = moduleIcons[permissionModule as keyof typeof moduleIcons] || Settings
  const colorClass = moduleColors[permissionModule as keyof typeof moduleColors] || moduleColors.general

  return (
    <ProtectedRoute requiredPermissions={['rbac:manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/permissions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {permission.nombre}
                </h1>
                <p className="text-gray-600">{permission.descripcion}</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push(`/dashboard/permissions/${permission.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Permiso
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Permission Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Información del Permiso
                </CardTitle>
                <CardDescription>
                  Datos y configuración del permiso del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Permiso</Label>
                    <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                      {permission.nombre}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Descripción</Label>
                    <p className="text-sm font-medium">
                      {permission.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Módulo</Label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}
                      >
                        {permissionModule}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Acción</Label>
                    <Badge variant="secondary" className="capitalize">
                      {action}
                    </Badge>
                  </div>

                  {permission.scope && (
                    <div>
                      <Label>Alcance</Label>
                      <Badge variant="outline" className="capitalize">
                        {permission.scope}
                      </Badge>
                    </div>
                  )}
                  
                  <div>
                    <Label>Fecha de Creación</Label>
                    <p className="text-sm font-medium">
                      {formatDateTime(permission.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Roles Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5" />
                    <Label>Roles que tienen este Permiso ({permission.roles?.length || 0})</Label>
                  </div>
                  {permission.roles && permission.roles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permission.roles.map((role) => (
                        <div 
                          key={role.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="font-medium text-sm capitalize">{role.nombre}</div>
                          {role.descripcion && (
                            <div className="text-xs text-gray-600 mt-1">
                              {role.descripcion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Crown className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Sin roles asignados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permission Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Detalles técnicos del permiso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID del Permiso</Label>
                  <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded break-all">
                    {permission.id}
                  </p>
                </div>

                <div>
                  <Label>Módulo del Sistema</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium capitalize">{permissionModule}</span>
                  </div>
                </div>

                <div>
                  <Label>Tipo de Acción</Label>
                  <p className="text-sm font-medium capitalize">{action}</p>
                </div>

                {permission.scope && (
                  <div>
                    <Label>Alcance</Label>
                    <p className="text-sm font-medium capitalize">{permission.scope}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label>Estadísticas</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Roles asignados:</span>
                      <span className="font-medium">{permission.roles?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t text-xs text-gray-500">
                  <div>
                    <strong>Nota:</strong> Los permisos son componentes del sistema y no pueden ser eliminados.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>
              Metadatos y detalles técnicos del permiso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Identificador Único</Label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {permission.id}
                </p>
              </div>
              
              <div>
                <Label>Nombre Técnico</Label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                  {permission.nombre}
                </p>
              </div>
              
              <div>
                <Label>Total de Roles</Label>
                <p className="text-sm font-medium">
                  {permission.roles?.length || 0} roles
                </p>
              </div>
              
              <div>
                <Label>Fecha de Creación</Label>
                <p className="text-sm font-medium">
                  {new Date(permission.createdAt).toLocaleDateString('es-ES')}
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
