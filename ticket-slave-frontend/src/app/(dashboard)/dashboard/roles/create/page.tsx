'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Permission, CreateRoleRequest } from '@/types'

export default function CreateRolePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  
  const [formData, setFormData] = useState<CreateRoleRequest>({
    nombre: '',
    descripcion: '',
    permissions: []
  })

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true)
        const response = await rbacAPI.getPermissions()
        setPermissions(response.data)
      } catch (error) {
        console.error('Error fetching permissions:', error)
        toast.error('Error al cargar permisos')
      } finally {
        setLoadingPermissions(false)
      }
    }

    fetchPermissions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del rol es requerido')
      return
    }

    try {
      setLoading(true)
      
      // Create role first
      const roleResponse = await rbacAPI.createRole({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim()
      })
      
      const newRole = roleResponse.data
      
      // Assign permissions if any selected
      if (formData.permissions && formData.permissions.length > 0) {
        await rbacAPI.assignPermissionsToRole(newRole.id, formData.permissions)
      }
      
      toast.success('Rol creado exitosamente')
      router.push('/dashboard/roles')
    } catch (error: unknown) {
      console.error('Error creating role:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string }; status?: number } }
        if (errorResponse.response?.data?.message) {
          toast.error(errorResponse.response.data.message)
        } else if (errorResponse.response?.status === 409) {
          toast.error('Ya existe un rol con ese nombre')
        } else {
          toast.error('Error al crear el rol')
        }
      } else {
        toast.error('Error al crear el rol')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev: CreateRoleRequest) => ({
      ...prev,
      permissions: checked 
        ? [...(prev.permissions || []), permissionId]
        : (prev.permissions || []).filter((id: string) => id !== permissionId)
    }))
  }

  // Group permissions by module for better organization
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const permissionModule = permission.module || 'general'
    if (!acc[permissionModule]) acc[permissionModule] = []
    acc[permissionModule].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

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
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Rol</h1>
            <p className="text-gray-600">Define un nuevo rol y sus permisos</p>
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
                  <div>
                    <Label htmlFor="nombre">Nombre del Rol *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev: CreateRoleRequest) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="ej: moderator, support, etc."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion || ''}
                      onChange={(e) => setFormData((prev: CreateRoleRequest) => ({ ...prev, descripcion: e.target.value }))}
                      placeholder="Describe las responsabilidades de este rol..."
                      rows={4}
                    />
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
                                  checked={(formData.permissions || []).includes(permission.id)}
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
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nombre.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Rol
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}
