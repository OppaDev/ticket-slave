'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { usersAPI, rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { User, Role, UpdateUserRequest } from '@/types'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  
  const [formData, setFormData] = useState<UpdateUserRequest>({
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    pais: '',
    status: 'activo',
    roleId: '',
  })

  // Fetch user data and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user details and roles in parallel
        const [userResponse, rolesResponse] = await Promise.all([
          usersAPI.getUser(userId),
          rbacAPI.getRoles()
        ])
        
        const userData = userResponse.data
        setUser(userData)
        setRoles(rolesResponse.data)
        
        // Populate form with user data
        setFormData({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          fechaNacimiento: userData.fechaNacimiento ? userData.fechaNacimiento.split('T')[0] : '',
          pais: userData.pais || '',
          status: userData.status || 'activo',
          roleId: userData.roleId || '',
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Error al cargar los datos del usuario')
        router.push('/dashboard/users')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId, router])

  const handleInputChange = (field: keyof UpdateUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.nombre?.trim() || !formData.apellido?.trim() || !formData.email?.trim()) {
      toast.error('Los campos nombre, apellido y email son obligatorios')
      return
    }

    if (!formData.roleId) {
      toast.error('Debe seleccionar un rol')
      return
    }

    try {
      setSaving(true)
      await usersAPI.updateUser(userId, formData)
      toast.success('Usuario actualizado exitosamente')
      router.push('/dashboard/users')
    } catch (error: unknown) {
      console.error('Error updating user:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data && 
        typeof error.response.data === 'object' && 'message' in error.response.data 
        ? (error.response.data as { message: string }).message 
        : 'Error al actualizar usuario'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['users:update:any']}>
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
      <ProtectedRoute requiredPermissions={['users:update:any']}>
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
    <ProtectedRoute requiredPermissions={['users:update:any']}>
      <div className="space-y-6">
        {/* Header */}
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
              Editar Usuario
            </h1>
            <p className="text-gray-600">
              Modificar información de {user.nombre} {user.apellido}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Actualiza los datos del usuario. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ingresa el nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    type="text"
                    placeholder="Ingresa el apellido"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  />
                </div>

                {/* País */}
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    type="text"
                    placeholder="Ingresa el país"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                  />
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => handleInputChange('roleId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <span className="capitalize">{role.nombre}</span>
                          {role.descripcion && (
                            <span className="text-gray-500 ml-2">- {role.descripcion}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'activo' | 'inactivo') => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={saving}>
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
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/users')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
