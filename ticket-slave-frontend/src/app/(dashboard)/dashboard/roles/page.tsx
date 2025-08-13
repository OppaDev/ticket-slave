'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Crown, 
  Users as UsersIcon, 
  ShoppingCart,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/types'

const roleIcons = {
  admin: Crown,
  organizer: UsersIcon,
  customer: ShoppingCart,
}

const roleColors = {
  admin: 'text-purple-600 bg-purple-50 border-purple-200',
  organizer: 'text-blue-600 bg-blue-50 border-blue-200', 
  customer: 'text-green-600 bg-green-50 border-green-200',
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // Fetch roles (basic info)
  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await rbacAPI.getRoles()
      const data = response.data
      
      if (Array.isArray(data)) {
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  // Fetch detailed role with permissions and users
  const fetchRoleDetails = async (roleId: string) => {
    try {
      const response = await rbacAPI.getRole(roleId)
      const detailedRole = response.data
      
      // Actualizar el rol específico con información detallada
      setRoles(prev => prev.map(role => 
        role.id === roleId ? detailedRole : role
      ))
      
      return detailedRole
    } catch (error) {
      console.error('Error fetching role details:', error)
      toast.error('Error al cargar detalles del rol')
      return null
    }
  }

  // Delete role
  const deleteRole = async (roleId: string) => {
    try {
      setDeleting(true)
      await rbacAPI.deleteRole(roleId)
      toast.success('Rol eliminado exitosamente')
      setRoles(prev => prev.filter(role => role.id !== roleId))
      setRoleToDelete(null)
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Error al eliminar rol')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
            <p className="text-gray-600 mt-1">
              Administra roles, permisos y asignaciones del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchRoles} 
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={() => router.push('/dashboard/roles/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron roles
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = roleIcons[role.nombre as keyof typeof roleIcons] || Settings
              const colorClass = roleColors[role.nombre as keyof typeof roleColors] || roleColors.customer

              return (
                <Card key={role.id} className={`${colorClass} border-2`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="capitalize text-lg">
                            {role.nombre}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {role.descripcion}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchRoleDetails(role.id)}
                        className="opacity-70 hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Permissions */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Permisos</h4>
                      {role.permissions && role.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission) => (
                            <Badge 
                              key={permission.id} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {permission.nombre}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {role.permissions ? 'Sin permisos asignados' : 'Cargar para ver permisos'}
                        </div>
                      )}
                    </div>

                    {/* Users */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Usuarios</h4>
                      {role.users && role.users.length > 0 ? (
                        <div className="space-y-1">
                          {role.users.slice(0, 2).map((user) => (
                            <div key={user.id} className="text-sm flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                {user.nombre.charAt(0)}
                              </div>
                              <span>{user.nombre} {user.apellido}</span>
                            </div>
                          ))}
                          {role.users.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{role.users.length - 2} usuarios más
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {role.users ? 'Sin usuarios asignados' : 'Cargar para ver usuarios'}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Creado: {formatDate(role.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/roles/${role.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => setRoleToDelete(role)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el rol &quot;<strong>{roleToDelete?.nombre}</strong>&quot;?
                <br /><br />
                Esta acción no se puede deshacer. Todos los usuarios con este rol perderán sus permisos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setRoleToDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => roleToDelete && deleteRole(roleToDelete.id)}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
