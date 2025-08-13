'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { authAPI, rbacAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import type { Role, CreateUserRequest } from '@/types'

export default function CreateUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CreateUserRequest>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    roleId: '',
    status: 'active',
  })

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rbacAPI.getRoles()
        setRoles(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast.error('Error al cargar roles')
      }
    }

    fetchRoles()
  }, [])

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.roleId) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setLoading(true)
      // Usar authAPI.register en lugar de usersAPI.createUser
      await authAPI.register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId,
        fechaNacimiento: formData.fechaNacimiento || '',
        pais: formData.pais || '',
        aceptaTerminos: true // Siempre true para usuarios creados por admin
      })
      toast.success('Usuario creado exitosamente')
      router.push('/dashboard/users')
    } catch (error: unknown) {
      console.error('Error creating user:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data && 
        typeof error.response.data === 'object' && 'message' in error.response.data 
        ? (error.response.data as { message: string }).message 
        : 'Error al crear usuario'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const countries = [
    { code: 'EC', name: 'Ecuador' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Perú' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'BR', name: 'Brasil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'BO', name: 'Bolivia' },
  ]

  return (
    <ProtectedRoute requiredPermissions={['users:create']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
            <p className="text-gray-600 mt-1">
              Agrega un nuevo usuario al sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Completa los datos del nuevo usuario. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Juan"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    placeholder="Ej: Pérez"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento || ''}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Select 
                    value={formData.pais || ''} 
                    onValueChange={(value) => handleInputChange('pais', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleId">Rol *</Label>
                  <Select 
                    value={formData.roleId} 
                    onValueChange={(value) => handleInputChange('roleId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span className="capitalize font-medium">{role.nombre}</span>
                            <span className="text-xs text-gray-500">{role.descripcion}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select 
                    value={formData.status || 'active'} 
                    onValueChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
