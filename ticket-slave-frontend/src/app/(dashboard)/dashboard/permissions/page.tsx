'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Users,
  Calendar,
  Ticket,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  ShoppingCart,
  Package
} from 'lucide-react'
import { toast } from 'sonner'
import type { Permission } from '@/types'

const permissionIcons = {
  'users': Users,
  'events': Calendar,
  'tickets': Ticket,
  'rbac': Shield,
  'cart': ShoppingCart,
  'orders': Package
} as const

const permissionColors = {
  'users': 'text-blue-600 bg-blue-50 border-blue-200',
  'events': 'text-green-600 bg-green-50 border-green-200',
  'tickets': 'text-purple-600 bg-purple-50 border-purple-200',
  'rbac': 'text-red-600 bg-red-50 border-red-200',
  'cart': 'text-orange-600 bg-orange-50 border-orange-200',
  'orders': 'text-teal-600 bg-teal-50 border-teal-200',
} as const

// Extract module from permission name
const getPermissionModule = (permissionName: string): string => {
  const parts = permissionName.split(':')
  return parts[0] || 'general'
}

// Extract action from permission name
const getPermissionAction = (permissionName: string): string => {
  const parts = permissionName.split(':')
  return parts[1] || 'manage'
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch permissions (basic info)
  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await rbacAPI.getPermissions()
      const data = response.data
      
      if (Array.isArray(data)) {
        setPermissions(data)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      toast.error('Error al cargar permisos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch detailed permission with roles
  const fetchPermissionDetails = async (permissionId: string) => {
    try {
      const response = await rbacAPI.getPermission(permissionId)
      const detailedPermission = response.data
      
      // Actualizar el permiso específico con información detallada
      setPermissions(prev => prev.map(permission => 
        permission.id === permissionId ? detailedPermission : permission
      ))
      
      return detailedPermission
    } catch (error) {
      console.error('Error fetching permission details:', error)
      toast.error('Error al cargar detalles del permiso')
      return null
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  // Group permissions by module
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const moduleType = getPermissionModule(permission.nombre)
    if (!groups[moduleType]) {
      groups[moduleType] = []
    }
    groups[moduleType].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <ProtectedRoute requiredPermissions={['rbac:manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
            <p className="text-gray-600 mt-1">
              Administra permisos del sistema y sus asignaciones a roles
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchPermissions} 
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Permiso
            </Button>
          </div>
        </div>

        {/* Permissions by Module */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron permisos
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([moduleType, modulePermissions]) => {
              const Icon = permissionIcons[moduleType as keyof typeof permissionIcons] || Settings
              const colorClass = permissionColors[moduleType as keyof typeof permissionColors] || permissionColors.users

              return (
                <Card key={moduleType}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="capitalize">
                          Módulo: {moduleType}
                        </CardTitle>
                        <CardDescription>
                          {modulePermissions.length} permisos disponibles
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modulePermissions.map((permission) => (
                        <Card key={permission.id} className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {permission.nombre}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {permission.descripcion}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchPermissionDetails(permission.id)}
                                className="opacity-70 hover:opacity-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3">
                            {/* Action Badge */}
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {getPermissionAction(permission.nombre)}
                              </Badge>
                            </div>

                            {/* Assigned Roles */}
                            <div>
                              <h5 className="font-medium text-sm mb-1">Asignado a roles</h5>
                              {permission.roles && permission.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {permission.roles.map((role) => (
                                    <Badge 
                                      key={role.id} 
                                      variant="secondary" 
                                      className="text-xs"
                                    >
                                      {role.nombre}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  {permission.roles ? 'Sin roles asignados' : 'Cargar para ver roles'}
                                </div>
                              )}
                            </div>

                            {/* Metadata */}
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                              Creado: {formatDate(permission.createdAt)}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                Editar
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Roles
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
