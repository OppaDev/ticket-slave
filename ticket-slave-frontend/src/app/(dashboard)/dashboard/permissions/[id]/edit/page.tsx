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
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Shield, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Permission } from '@/types'

interface UpdatePermissionRequest {
  descripcion?: string
}

export default function EditPermissionPage() {
  const router = useRouter()
  const params = useParams()
  const permissionId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permission, setPermission] = useState<Permission | null>(null)
  
  const [formData, setFormData] = useState<UpdatePermissionRequest>({
    descripcion: ''
  })

  // Fetch permission data
  useEffect(() => {
    const fetchPermission = async () => {
      try {
        setLoading(true)
        const response = await rbacAPI.getPermission(permissionId)
        const permissionData = response.data
        
        setPermission(permissionData)
        setFormData({
          descripcion: permissionData.descripcion || ''
        })
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      
      // Update permission description
      await rbacAPI.updatePermission(permissionId, {
        descripcion: formData.descripcion?.trim()
      })
      
      toast.success('Permiso actualizado exitosamente')
      router.push('/dashboard/permissions')
    } catch (error: unknown) {
      console.error('Error updating permission:', error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { data?: { message?: string }; status?: number } }
        if (errorResponse.response?.data?.message) {
          toast.error(errorResponse.response.data.message)
        } else {
          toast.error('Error al actualizar el permiso')
        }
      } else {
        toast.error('Error al actualizar el permiso')
      }
    } finally {
      setSaving(false)
    }
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

  return (
    <ProtectedRoute requiredPermissions={['rbac:manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/permissions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Permiso: {permission.nombre}
            </h1>
            <p className="text-gray-600">Modifica la descripción y configuración del permiso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Información del Permiso
                  </CardTitle>
                  <CardDescription>
                    Edita los datos configurables del permiso del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Read-only fields */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Información del Sistema</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Los siguientes campos son gestionados por el sistema y no pueden ser modificados.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del Permiso (Solo lectura)</Label>
                      <Input
                        id="nombre"
                        value={permission.nombre}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="modulo">Módulo (Solo lectura)</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="capitalize">
                          {permissionModule}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accion">Acción (Solo lectura)</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {action}
                        </Badge>
                      </div>
                    </div>

                    {permission.scope && (
                      <div>
                        <Label htmlFor="scope">Alcance (Solo lectura)</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className="capitalize">
                            {permission.scope}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editable field */}
                  <div className="pt-4 border-t">
                    <div>
                      <Label htmlFor="descripcion">Descripción *</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData((prev: UpdatePermissionRequest) => ({ 
                          ...prev, 
                          descripcion: e.target.value 
                        }))}
                        placeholder="Describe qué permite hacer este permiso..."
                        rows={4}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Proporciona una descripción clara de lo que permite este permiso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permission Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Sistema</CardTitle>
                  <CardDescription>
                    Información técnica del permiso
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
                    <Label>Nombre Técnico</Label>
                    <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                      {permission.nombre}
                    </p>
                  </div>

                  <div>
                    <Label>Roles Asignados</Label>
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

                  {/* Roles using this permission */}
                  {permission.roles && permission.roles.length > 0 && (
                    <div>
                      <Label>Usado por Roles</Label>
                      <div className="space-y-1 mt-2">
                        {permission.roles.slice(0, 3).map((role) => (
                          <Badge 
                            key={role.id}
                            variant="outline" 
                            className="text-xs capitalize mr-1"
                          >
                            {role.nombre}
                          </Badge>
                        ))}
                        {permission.roles.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{permission.roles.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t text-xs text-gray-500">
                    <div>
                      <strong>Nota:</strong> Los permisos son componentes críticos del sistema. Solo se permite editar la descripción.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/dashboard/permissions')}
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
