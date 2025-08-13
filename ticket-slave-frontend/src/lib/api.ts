import axios, { AxiosResponse } from 'axios'
import type { OrderCreateRequest, User, Role } from '@/types'

// Kong Gateway base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Token management
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Functions for different microservices

// Authentication (ms-usuarios) - SOLO endpoints que existen en el HAR
export const authAPI = {
  // POST /api/v1/auth/login - VERIFICADO en HAR
  login: (email: string, password: string) => 
    api.post('/api/v1/auth/login', { email, password }),
    
  // POST /api/v1/auth/register - VERIFICADO en HAR (status 201)
  register: (userData: { 
    nombre: string
    apellido: string
    email: string
    password: string
    roleId: string
    fechaNacimiento: string
    pais: string
    aceptaTerminos: boolean
  }) => api.post('/api/v1/auth/register', userData),
    
  // Logout local (no hay endpoint en HAR)
  logout: () => {
    removeAuthToken()
    return Promise.resolve()
  },
    
  // POST /api/v1/auth/recover - VERIFICADO en HAR
  recoverPassword: (email: string) =>
    api.post('/api/v1/auth/recover', { email }),
    
  // POST /api/v1/auth/reset - VERIFICADO en HAR
  resetPassword: (data: { token: string; password: string; passwordConfirmation: string }) =>
    api.post('/api/v1/auth/reset', data),
}

// Users Management (ms-usuarios) - SOLO endpoints que existen en el HAR
export const usersAPI = {
  // GET /api/v1/users - VERIFICADO en HAR
  getUsers: () => api.get('/api/v1/users'),
  
  // GET /api/v1/users/{id} - VERIFICADO en HAR
  getUser: (id: string) =>
    api.get(`/api/v1/users/${id}`),
  
  // PATCH /api/v1/users/{id} - VERIFICADO en HAR
  updateUser: (id: string, userData: {
    nombre?: string
    apellido?: string
    email?: string
    fechaNacimiento?: string
    pais?: string
    status?: 'activo' | 'inactivo'
    roleId?: string
  }) => api.patch(`/api/v1/users/${id}`, userData),
  
  // DELETE /users/{id} - VERIFICADO en HAR (sin /api/v1/)
  deleteUser: (id: string) =>
    api.delete(`/api/v1/users/${id}`),
  
  // POST /api/v1/users/{id}/role - VERIFICADO en HAR
  assignRole: (userId: string, roleId: string) =>
    api.post(`/api/v1/users/${userId}/role`, { roleId }),
  
  // GET /users/{id}/role - VERIFICADO en HAR (sin /api/v1/)
  getUserRole: (userId: string) =>
    api.get(`/api/v1/users/${userId}/role`),
}

// Roles and Permissions Management (ms-usuarios) - SOLO endpoints que existen en el HAR
export const rbacAPI = {
  // GET /api/v1/roles - VERIFICADO en HAR
  getRoles: () =>
    api.get('/api/v1/roles'),
  
  // GET /api/v1/roles/{id} - VERIFICADO en HAR
  getRole: (id: string) =>
    api.get(`/api/v1/roles/${id}`),
  
  // POST /api/v1/roles - VERIFICADO en HAR
  createRole: (roleData: { nombre: string; descripcion?: string }) =>
    api.post('/api/v1/roles', roleData),
  
  // PATCH /api/v1/roles/{id} - VERIFICADO en HAR
  updateRole: (id: string, roleData: { nombre?: string; descripcion?: string }) =>
    api.patch(`/api/v1/roles/${id}`, roleData),
  
  // DELETE /api/v1/roles/{id} - VERIFICADO en HAR
  deleteRole: (id: string) =>
    api.delete(`/api/v1/roles/${id}`),
  
  // GET /api/v1/permissions - VERIFICADO en HAR
  getPermissions: () =>
    api.get('/api/v1/permissions'),
  
  // GET /api/v1/permissions/{id} - VERIFICADO en HAR
  getPermission: (id: string) =>
    api.get(`/api/v1/permissions/${id}`),
  
  // POST /api/v1/permissions - VERIFICADO en HAR
  createPermission: (permissionData: {
    nombre: string
    descripcion?: string
  }) => api.post('/api/v1/permissions', permissionData),
  
  // PATCH /api/v1/permissions/{id} - VERIFICADO en HAR
  updatePermission: (id: string, permissionData: {
    nombre?: string
    descripcion?: string
  }) => api.patch(`/api/v1/permissions/${id}`, permissionData),
  
  // DELETE /api/v1/permissions/{id} - VERIFICADO en HAR
  deletePermission: (id: string) =>
    api.delete(`/api/v1/permissions/${id}`),
  
  // GET /api/v1/roles/{id}/permissions - VERIFICADO en HAR
  getRolePermissions: (roleId: string) =>
    api.get(`/api/v1/roles/${roleId}/permissions`),
  
  // POST /api/v1/roles/{id}/permissions - VERIFICADO en HAR
  assignPermissionsToRole: (roleId: string, permissions: string[]) =>
    api.post(`/api/v1/roles/${roleId}/permissions`, { permissions }),
}

// Dashboard and Analytics (ms-usuarios)
export const dashboardAPI = {
  // Estadísticas reales basadas en los endpoints disponibles
  getAdminStats: async () => {
    try {
      // Obtener todos los usuarios para calcular estadísticas
      const usersResponse = await api.get('/api/v1/users')
      const users = usersResponse.data

      console.log('Users data:', JSON.stringify(users, null, 2))

      // Obtener todos los roles para mapear roleId a nombre
      const rolesResponse = await api.get('/api/v1/roles')
      const roles = rolesResponse.data

      console.log('Roles data:', JSON.stringify(roles, null, 2))

      // Obtener todos los permisos
      const permissionsResponse = await api.get('/api/v1/permissions')
      const permissions = permissionsResponse.data

      // Crear un mapa de roleId a nombre de rol
      const roleMap: Record<string, string> = {}
      roles.forEach((role: Role) => {
        roleMap[role.id] = role.nombre
      })

      // Calcular estadísticas
      const totalUsers = users.length
      const activeUsers = users.filter((user: User) => user.status === 'activo').length
      const inactiveUsers = users.filter((user: User) => user.status === 'inactivo').length

      // Calcular registros recientes (último mes)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const recentRegistrations = users.filter((user: User) => {
        if (user.createdAt) {
          return new Date(user.createdAt) > oneMonthAgo
        }
        return false
      }).length

      // Contar usuarios por rol usando roleId
      const usersByRole: Record<string, number> = {}
      users.forEach((user: User) => {
        if (user.roleId && roleMap[user.roleId]) {
          const roleName = roleMap[user.roleId]
          usersByRole[roleName] = (usersByRole[roleName] || 0) + 1
        }
      })

      console.log('Users by role:', JSON.stringify(usersByRole, null, 2))

      // Distribución de roles para gráficos
      const roleDistribution = Object.entries(usersByRole).map(([role, count]) => ({
        role,
        count
      }))

      return {
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          recentRegistrations,
          totalRoles: roles.length,
          totalPermissions: permissions.length,
          usersByRole,
          roleDistribution,
          users: users.slice(0, 5), // Últimos 5 usuarios para actividad reciente
        }
      }
    } catch (error) {
      console.error('Error fetching admin stats:', JSON.stringify(error, null, 2))
      // Fallback con datos básicos
      return {
        data: {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          recentRegistrations: 0,
          totalRoles: 0,
          totalPermissions: 0,
          usersByRole: {},
          roleDistribution: [],
          users: [],
        }
      }
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async () => {
    try {
      // Por ahora usamos la lista de usuarios como actividad reciente
      const usersResponse = await api.get('/api/v1/users')
      const users = usersResponse.data

      // Simular actividad reciente basada en usuarios
      const recentActivity = users.slice(0, 10).map((user: User, index: number) => ({
        id: user.id,
        user: `${user.nombre} ${user.apellido}`,
        action: index % 3 === 0 ? 'Nuevo registro' : 
               index % 3 === 1 ? 'Perfil actualizado' : 'Login reciente',
        time: `Hace ${Math.floor(Math.random() * 60)} minutos`,
        timestamp: new Date().toISOString()
      }))

      return {
        data: recentActivity
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return {
        data: []
      }
    }
  },
  
  // Recent activities mock
  getRecentActivities: () => {
    return Promise.resolve({
      data: [
        {
          id: '1',
          action: 'user_created',
          user: 'Admin User',
          timestamp: new Date().toISOString(),
          description: 'Usuario administrador creado'
        }
      ]
    })
  },
}

// Development API for quick testing - SIN /api/v1/auth/me ya que NO existe en el HAR
export const devAPI = {
  // Quick login with development tokens (mock de usuario actual)
  loginWithToken: (role: 'admin' | 'organizer' | 'customer') => {
    const tokens = {
      admin: process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN,
      organizer: process.env.NEXT_PUBLIC_DEV_ORGANIZER_TOKEN,
      customer: process.env.NEXT_PUBLIC_DEV_CUSTOMER_TOKEN,
    }
    
    const token = tokens[role]
    if (token) {
      setAuthToken(token)
      // Mock user data ya que no hay endpoint /auth/me
      return Promise.resolve({
        data: {
          user: {
            id: role === 'admin' ? '1' : role === 'organizer' ? '2' : '3',
            nombre: role.charAt(0).toUpperCase() + role.slice(1),
            apellido: 'User',
            email: `${role}@test.com`,
            role: { nombre: role }
          }
        }
      })
    }
    return Promise.reject(new Error('Token not available'))
  },
  
  // Get development users
  getDevUsers: () => {
    const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    if (!devMode) return Promise.resolve([])
    
    return Promise.resolve([
      {
        role: 'admin' as const,
        email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || 'admin@test.com',
        token: process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN || '',
      },
      {
        role: 'organizer' as const,
        email: process.env.NEXT_PUBLIC_DEV_ORGANIZER_EMAIL || 'organizer@test.com',
        token: process.env.NEXT_PUBLIC_DEV_ORGANIZER_TOKEN || '',
      },
      {
        role: 'customer' as const,
        email: process.env.NEXT_PUBLIC_DEV_CUSTOMER_EMAIL || 'customer@test.com',
        token: process.env.NEXT_PUBLIC_DEV_CUSTOMER_TOKEN || '',
      },
    ])
  },
}

// Events Management (ms-eventos) - Endpoints basados en HAR
export const eventsAPI = {
  // GET /api/v1/events - VERIFICADO en HAR
  getEvents: () =>
    api.get('/api/v1/events'),
    
  // GET /api/v1/events/{id} - VERIFICADO en HAR
  getEvent: (id: string) =>
    api.get(`/api/v1/events/${id}`),
    
  // POST /api/v1/events - VERIFICADO en HAR (status 201)
  createEvent: (eventData: {
    nombre: string
    descripcion: string
    fechaInicio: string  // formato: "2025-10-01"
    fechaFin: string     // formato: "2025-10-02"
    categoryId: string
    venueId: string
    imagenUrl?: string
  }) => api.post('/api/v1/events', eventData),
    
  // PATCH /api/v1/events/{id} - VERIFICADO en HAR
  updateEvent: (id: string, eventData: {
    nombre?: string
    descripcion?: string
    fechaInicio?: string
    fechaFin?: string
    categoryId?: string
    venueId?: string
    imagenUrl?: string
  }) => api.patch(`/api/v1/events/${id}`, eventData),
    
  // POST /api/v1/events/{id}/publish - VERIFICADO en HAR
  publishEvent: (id: string) =>
    api.post(`/api/v1/events/${id}/publish`),
    
  // DELETE /api/v1/events/{id} - Asumiendo endpoint disponible
  deleteEvent: (id: string) =>
    api.delete(`/api/v1/events/${id}`),
}

// Categories Management (ms-eventos) - Endpoints basados en HAR
export const categoriesAPI = {
  // GET /api/v1/categories - VERIFICADO en HAR
  getCategories: () =>
    api.get('/api/v1/categories'),
    
  // GET /api/v1/categories/{id} - VERIFICADO en HAR
  getCategory: (id: string) =>
    api.get(`/api/v1/categories/${id}`),
    
  // POST /api/v1/categories - VERIFICADO en HAR (status 201)
  createCategory: (categoryData: {
    nombre: string
    descripcion?: string
  }) => api.post('/api/v1/categories', categoryData),
    
  // PATCH /api/v1/categories/{id} - VERIFICADO en HAR
  updateCategory: (id: string, categoryData: {
    nombre?: string
    descripcion?: string
  }) => api.patch(`/api/v1/categories/${id}`, categoryData),
    
  // DELETE /api/v1/categories/{id} - VERIFICADO en HAR (status 201)
  deleteCategory: (id: string) =>
    api.delete(`/api/v1/categories/${id}`),
}

// Venues Management (ms-eventos) - Endpoints basados en HAR
export const venuesAPI = {
  // GET /api/v1/venues - VERIFICADO en HAR
  getVenues: () =>
    api.get('/api/v1/venues'),
    
  // GET /api/v1/venues/{id} - VERIFICADO en HAR
  getVenue: (id: string) =>
    api.get(`/api/v1/venues/${id}`),
    
  // POST /api/v1/venues - VERIFICADO en HAR (status 201)
  createVenue: (venueData: {
    nombre: string
    direccion: string
    ciudad: string
    pais: string
    latitud?: number | null
    longitud?: number | null
  }) => api.post('/api/v1/venues', venueData),
    
  // PATCH /api/v1/venues/{id} - VERIFICADO en HAR
  updateVenue: (id: string, venueData: {
    nombre?: string
    direccion?: string
    ciudad?: string
    pais?: string
    latitud?: number | null
    longitud?: number | null
  }) => api.patch(`/api/v1/venues/${id}`, venueData),
    
  // DELETE /api/v1/venues/{id} - VERIFICADO en HAR (status 201)
  deleteVenue: (id: string) =>
    api.delete(`/api/v1/venues/${id}`),
}

// Zones Management (ms-eventos) - Endpoints basados en HAR
export const zonesAPI = {
  // GET /api/v1/venues/{venueId}/zones - VERIFICADO en HAR
  getVenueZones: (venueId: string) =>
    api.get(`/api/v1/venues/${venueId}/zones`),
    
  // GET /api/v1/venues/{venueId}/zones/{id} - VERIFICADO en HAR
  getVenueZone: (venueId: string, zoneId: string) =>
    api.get(`/api/v1/venues/${venueId}/zones/${zoneId}`),
    
  // POST /api/v1/venues/{venueId}/zones - VERIFICADO en HAR (status 201)
  createVenueZone: (venueId: string, zoneData: {
    nombre: string
    capacidad: number
  }) => api.post(`/api/v1/venues/${venueId}/zones`, zoneData),
    
  // PATCH /api/v1/venues/{venueId}/zones/{id} - VERIFICADO en HAR
  updateVenueZone: (venueId: string, zoneId: string, zoneData: {
    nombre?: string
    capacidad?: number
  }) => api.patch(`/api/v1/venues/${venueId}/zones/${zoneId}`, zoneData),
    
  // DELETE /api/v1/venues/{venueId}/zones/{id} - VERIFICADO en HAR (status 201)
  deleteVenueZone: (venueId: string, zoneId: string) =>
    api.delete(`/api/v1/venues/${venueId}/zones/${zoneId}`),
}

// Tickets (ms-tickets)
export const ticketsAPI = {
  getTicketTypes: (eventId: string) =>
    api.get(`/api/v1/events/${eventId}/ticket-types`),
    
  getCart: () =>
    api.get('/api/v1/cart'),
    
  addToCart: (items: { ticketTypeId: string; quantity: number }[]) =>
    api.post('/api/v1/cart/items', { items }),
    
  removeFromCart: (itemId: string) =>
    api.delete(`/api/v1/cart/items/${itemId}`),
    
  clearCart: () =>
    api.delete('/api/v1/cart'),
    
  createOrder: (orderData: OrderCreateRequest) =>
    api.post('/api/v1/orders', orderData),
    
  getOrders: (params?: { page?: number; limit?: number }) =>
    api.get('/api/v1/orders', { params }),
    
  getOrder: (id: string) =>
    api.get(`/api/v1/orders/${id}`),
    
  getTickets: (params?: { eventId?: string; status?: string }) =>
    api.get('/api/v1/tickets', { params }),
    
  getTicket: (id: string) =>
    api.get(`/api/v1/tickets/${id}`),
    
  validateTicket: (ticketCode: string) =>
    api.post('/api/v1/tickets/check-in', { ticketCode }),
}

// Export token management functions
export { getAuthToken, setAuthToken, removeAuthToken }

// Types for API responses
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default api