'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Crown, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Role, Permission, UpdateRoleRequest } from '@/types'

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  
  const [formData, setFormData] = useState<UpdateRoleRequest & { permissions: string[] }>({
    nombre: '',
    descripcion: '',
    permissions: []
  })

  // Fetch role and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setLoadingPermissions(true)
        
        // Fetch role details and all permissions in parallel
        const [roleResponse, permissionsResponse] = await Promise.all([
          rbacAPI.getRole(roleId),
          rbacAPI.getPermissions()
        ])
        
        const roleData = roleResponse.data
        const permissionsData = permissionsResponse.data
        
        setRole(roleData)
        setPermissions(permissionsData)
        
        // Set form data with current role data
        setFormData({
          nombre: roleData.nombre,
          descripcion: roleData.descripcion || '',
          permissions: roleData.permissions?.map((p: Permission) => p.id) || []
        })
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error al cargar los datos')
        router.push('/dashboard/roles')
      } finally {
        setLoading(false)
        setLoadingPermissions(false)
      }
    }

    if (roleId) {
      fetchData()
    }
  }, [roleId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      
      // Update only description (name cannot be changed)
      await rbacAPI.updateRole(roleId, {
        descripcion: formData.descripcion?.trim()
      })
      
      // Update permissions - assign all selected permissions
      if (formData.permissions.length > 0) {
        await rbacAPI.assignPermissionsToRole(roleId, formData.permissions)
      }
      
      toast.success('Rol actualizado exitosamente')
      router.push('/dashboard/roles')
    } catch (error: unknown) {
      console.error('Error updating role:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string }; status?: number } }
        if (errorResponse.response?.data?.message) {
          toast.error(errorResponse.response.data.message)
        } else if (errorResponse.response?.status === 409) {
          toast.error('Ya existe un rol con ese nombre')
        } else {
          toast.error('Error al actualizar el rol')
        }
      } else {
        toast.error('Error al actualizar el rol')
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev: UpdateRoleRequest & { permissions: string[] }) => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((id: string) => id !== permissionId)
    }))
  }

  // Group permissions by module for better organization
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const permissionModule = permission.module || 'general'
    if (!acc[permissionModule]) acc[permissionModule] = []
    acc[permissionModule].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

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

  return (
    <ProtectedRoute requiredPermissions={['rbac:manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/roles')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Rol: {role.nombre}
            </h1>
            <p className="text-gray-600">Modifica la información y permisos del rol</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>
                    Datos principales del rol
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Information notice */}
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Restricciones de Edición</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Por motivos de seguridad, el nombre del rol no puede ser modificado. Solo puedes editar la descripción y los permisos asignados.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nombre">Nombre del Rol (Solo lectura)</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El nombre del rol no puede ser modificado por seguridad del sistema.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion || ''}
                      onChange={(e) => setFormData((prev: UpdateRoleRequest & { permissions: string[] }) => ({ 
                        ...prev, 
                        descripcion: e.target.value 
                      }))}
                      placeholder="Describe las responsabilidades de este rol..."
                      rows={4}
                    />
                  </div>

                  {/* Role Metadata */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-xs text-gray-500">
                      <strong>ID:</strong> {role.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Creado:</strong> {new Date(role.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    {role.updatedAt && (
                      <div className="text-xs text-gray-500">
                        <strong>Actualizado:</strong> {new Date(role.updatedAt).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos</CardTitle>
                  <CardDescription>
                    Selecciona los permisos que tendrá este rol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPermissions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Cargando permisos...</span>
                    </div>
                  ) : permissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron permisos disponibles
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="space-y-3">
                          <h4 className="font-medium text-sm uppercase tracking-wide text-gray-700 border-b pb-2">
                            {module}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {modulePermissions.map((permission) => (
                              <div 
                                key={permission.id} 
                                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissions.includes(permission.id)}
                                  onCheckedChange={(checked: boolean) => 
                                    handlePermissionChange(permission.id, checked)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <label 
                                    htmlFor={permission.id}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {permission.nombre}
                                  </label>
                                  {permission.descripcion && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {permission.descripcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/dashboard/roles')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}
