// User and Authentication Types
export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  roleId: string
  role?: Role
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  nombre: string
  descripcion: string
  permissions?: Permission[]
}

export interface Permission {
  id: string
  nombre: string
  descripcion: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Event Types
export interface Event {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  status: 'BORRADOR' | 'PUBLICADO'
  categoryId: string
  venueId: string
  organizerId: string
  category?: Category
  venue?: Venue
  organizer?: User
  ticketTypes?: TicketType[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  nombre: string
  descripcion: string
  createdAt: string
  updatedAt: string
}

export interface Venue {
  id: string
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  organizerId: string
  zones?: Zone[]
  createdAt: string
  updatedAt: string
}

export interface Zone {
  id: string
  nombre: string
  capacidad: number
  venueId: string
  createdAt: string
  updatedAt: string
}

// Ticket Types
export interface TicketType {
  id: string
  eventId: string
  name: string
  price: number
  quantity: number
  sold: number
  description?: string
  event?: Event
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: string
  userId: string
  expiresAt: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  cartId: string
  ticketTypeId: string
  quantity: number
  priceAtReservation: number
  ticketType?: TicketType
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentGatewayId?: string
  items: OrderItem[]
  user?: User
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  ticketTypeId: string
  quantity: number
  priceAtPurchase: number
  ticketType?: TicketType
  tickets?: Ticket[]
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  orderItemId: string
  userId: string
  eventId: string
  ticketCode: string
  status: 'active' | 'used' | 'cancelled'
  qrCodeData: string
  validatedAt?: string
  event?: Event
  user?: User
  orderItem?: OrderItem
  createdAt: string
  updatedAt: string
}

// WebSocket Event Types
export interface WebSocketStockUpdate {
  eventId: string
  ticketTypeId: string
  ticketTypeName: string
  available: number
  sold: number
  timestamp: string
}

export interface WebSocketPaymentStatus {
  orderId: string
  status: 'processing' | 'success' | 'failed'
  timestamp: string
  message?: string
}

export interface WebSocketSaleNotification {
  eventId: string
  orderId: string
  userId: string
  userEmail: string
  totalAmount: number
  ticketsCount: number
  timestamp: string
}

export interface WebSocketValidation {
  eventId: string
  ticketCode: string
  validatedAt: string
  gateNumber?: string
  attendeeCount: number
  timestamp: string
}

export interface WebSocketPushNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  data?: any
  priority: 'high' | 'normal' | 'low'
  requiresAction: boolean
  timestamp: string
  expiresAt?: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  nombre: string
  apellido: string
  email: string
  password: string
  confirmPassword: string
}

export interface EventForm {
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  categoryId: string
  venueId: string
}

export interface TicketTypeForm {
  name: string
  description?: string
  price: number
  quantity: number
}

// API Response Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Component Props Types
export interface EventCardProps {
  event: Event
  onSelect?: (event: Event) => void
  showOrganizer?: boolean
}

export interface TicketSelectorProps {
  ticketTypes: TicketType[]
  onSelectionChange: (selections: { ticketTypeId: string; quantity: number }[]) => void
  disabled?: boolean
}

export interface CartSummaryProps {
  cart?: Cart
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
}

// Dashboard Types
export interface DashboardStats {
  totalEvents: number
  totalSales: number
  totalRevenue: number
  totalTicketsSold: number
  conversionRate: number
  period: 'today' | 'week' | 'month' | 'year'
}

export interface SalesMetrics {
  eventId: string
  eventName: string
  totalSales: number
  totalRevenue: number
  ticketsSold: number
  ticketsRemaining: number
  conversionRate: number
  lastSaleAt?: string
}

// Notification Types
export interface NotificationLog {
  id: string
  channel: 'email' | 'push' | 'sms'
  recipient: string
  template: string
  status: 'sent' | 'failed' | 'pending'
  content: any
  failReason?: string
  sentAt?: string
  createdAt: string
}