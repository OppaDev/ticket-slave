import axios, { AxiosResponse } from 'axios'
import type { EventCreateRequest, EventUpdateRequest, OrderCreateRequest } from '@/types'

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
  
  // GET /users/{id} - VERIFICADO en HAR (sin /api/v1/)
  getUser: (id: string) =>
    api.get(`/users/${id}`),
  
  // POST /api/v1/users - NO está en el HAR, pero necesario para crear usuarios
  createUser: (userData: {
    nombre: string
    apellido: string
    email: string
    password: string
    roleId: string
    fechaNacimiento?: string
    pais?: string
    aceptaTerminos?: boolean
    status?: 'active' | 'inactive'
  }) => api.post('/api/v1/users', userData),
  
  // PATCH /api/v1/users/{id} - VERIFICADO en HAR
  updateUser: (id: string, userData: {
    nombre?: string
    apellido?: string
    email?: string
    fechaNacimiento?: string
    pais?: string
    status?: 'active' | 'inactive'
    roleId?: string
  }) => api.patch(`/api/v1/users/${id}`, userData),
  
  // DELETE /users/{id} - VERIFICADO en HAR (sin /api/v1/)
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  // POST /api/v1/users/{id}/role - VERIFICADO en HAR
  assignRole: (userId: string, roleId: string) =>
    api.post(`/api/v1/users/${userId}/role`, { roleId }),
  
  // GET /users/{id}/role - VERIFICADO en HAR (sin /api/v1/)
  getUserRole: (userId: string) =>
    api.get(`/users/${userId}/role`),
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
  // Estadísticas simplificadas basadas en los datos del HAR
  getAdminStats: () => {
    // Mock data basado en la estructura de usuarios del HAR
    return Promise.resolve({
      data: {
        totalUsers: 3,
        activeUsers: 3,
        totalRoles: 3,
        totalPermissions: 15,
        roleDistribution: [
          { role: 'admin', count: 1 },
          { role: 'organizer', count: 1 },
          { role: 'customer', count: 1 }
        ]
      }
    })
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

// Events (ms-eventos) - Placeholders para futura implementación
export const eventsAPI = {
  getEvents: () =>
    api.get('/api/v1/events'),
    
  getEvent: (id: string) =>
    api.get(`/api/v1/events/${id}`),
    
  createEvent: (eventData: EventCreateRequest) =>
    api.post('/api/v1/events', eventData),
    
  updateEvent: (id: string, eventData: EventUpdateRequest) =>
    api.patch(`/api/v1/events/${id}`, eventData),
    
  publishEvent: (id: string) =>
    api.post(`/api/v1/events/${id}/publish`),
    
  getCategories: () =>
    api.get('/api/v1/categories'),
    
  getVenues: () =>
    api.get('/api/v1/venues'),
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