import axios, { AxiosResponse } from 'axios'

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

// Authentication (ms-usuarios)
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/api/v1/auth/login', { email, password }),
    
  register: (userData: { nombre: string; apellido: string; email: string; password: string }) =>
    api.post('/api/v1/auth/register', userData),
    
  logout: () => {
    removeAuthToken()
    return Promise.resolve()
  },
  
  getCurrentUser: () => 
    api.get('/api/v1/auth/me'),
}

// Events (ms-eventos)
export const eventsAPI = {
  getEvents: (params?: { category?: string; search?: string; page?: number }) =>
    api.get('/api/v1/events', { params }),
    
  getEvent: (id: string) =>
    api.get(`/api/v1/events/${id}`),
    
  createEvent: (eventData: any) =>
    api.post('/api/v1/events', eventData),
    
  updateEvent: (id: string, eventData: any) =>
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
    
  createOrder: (orderData: any) =>
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
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default api