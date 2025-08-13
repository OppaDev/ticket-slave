'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { usersAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Users as UsersIcon,
  ShoppingCart,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types'

const roleIcons = {
  admin: Crown,
  organizer: UsersIcon,
  customer: ShoppingCart,
}

const roleColors = {
  admin: 'text-purple-600 bg-purple-50',
  organizer: 'text-blue-600 bg-blue-50', 
  customer: 'text-green-600 bg-green-50',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getUsers()
      const data = response.data
      
      // La API devuelve un array directo, no paginado según el HAR
      if (Array.isArray(data)) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await usersAPI.getUsers()
        const data = response.data
        
        // La API devuelve un array directo, no paginado según el HAR
        if (Array.isArray(data)) {
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle search (client-side filtering since API doesn't support query params)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Filter users client-side
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = !roleFilter || user.role?.nombre === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm)
  }

  // Handle filter changes
  const handleFilterChange = (type: 'role' | 'status', value: string) => {
    if (type === 'role') {
      setRoleFilter(value)
    } else if (type === 'status') {
      setStatusFilter(value)
    }
  }

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await usersAPI.updateUser(userId, { status: newStatus })
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`)
      fetchUsers() // Refresh list
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Error al cambiar el estado del usuario')
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return
    }

    try {
      await usersAPI.deleteUser(userId)
      toast.success('Usuario eliminado exitosamente')
      fetchUsers() // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <ProtectedRoute requiredPermissions={['users:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchUsers} 
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={() => window.location.href = '/dashboard/users/create'}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <Select onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="organizer">Organizador</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                  setStatusFilter('')
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuarios ({filteredUsers.length})
            </CardTitle>
            <CardDescription>
              Lista de todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron usuarios con los filtros aplicados
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Usuario</th>
                        <th className="text-left py-3 px-2">Email</th>
                        <th className="text-left py-3 px-2">Rol</th>
                        <th className="text-left py-3 px-2">Estado</th>
                        <th className="text-left py-3 px-2">Registro</th>
                        <th className="text-left py-3 px-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const RoleIcon = roleIcons[user.role?.nombre as keyof typeof roleIcons] || UsersIcon
                        const roleColor = roleColors[user.role?.nombre as keyof typeof roleColors] || roleColors.customer

                        return (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold">
                                    {user.nombre.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{user.nombre} {user.apellido}</p>
                                  {user.pais && (
                                    <p className="text-xs text-gray-500">{user.pais}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${roleColor}`}>
                                  <RoleIcon className="h-3 w-3" />
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {user.role?.nombre}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                              >
                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.location.href = `/dashboard/users/${user.id}/edit`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleUserStatus(user.id, user.status)}
                                  className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                                >
                                  {user.status === 'active' ? 
                                    <UserX className="h-4 w-4" /> : 
                                    <UserCheck className="h-4 w-4" />
                                  }
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role?.nombre as keyof typeof roleIcons] || UsersIcon
                    const roleColor = roleColors[user.role?.nombre as keyof typeof roleColors] || roleColors.customer

                    return (
                      <div key={user.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="font-semibold">
                                {user.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.nombre} {user.apellido}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${roleColor}`}>
                              <RoleIcon className="h-3 w-3" />
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {user.role?.nombre}
                            </Badge>
                          </div>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Registro: {formatDate(user.createdAt)}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">Editar</Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                            >
                              {user.status === 'active' ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Statistics */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {filteredUsers.length} de {users.length} usuarios
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredUsers.length !== users.length && `Filtrados de ${users.length} total`}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
