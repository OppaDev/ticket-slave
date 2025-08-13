// User and Authentication Types
export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  password?: string // Only for creation/update
  status: 'active' | 'inactive'
  fechaNacimiento?: string
  pais?: string
  aceptaTerminos: boolean
  roleId: string
  role?: Role
  // Additional profile fields
  telefono?: string
  direccion?: string
  ciudad?: string
  avatar?: string
  preferencias?: UserPreferences
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UserPreferences {
  language: 'es' | 'en'
  timezone: string
  notifications: NotificationPreferences
  marketing: MarketingPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  eventReminders: boolean
  promotions: boolean
}

export interface MarketingPreferences {
  newsletter: boolean
  eventRecommendations: boolean
  partnerOffers: boolean
}

export interface Role {
  id: string
  nombre: 'admin' | 'organizer' | 'customer'
  descripcion: string
  permissions?: Permission[]
  createdAt: string
  updatedAt?: string
}

export interface Permission {
  id: string
  nombre: string
  descripcion: string
  module: 'users' | 'events' | 'tickets' | 'rbac' | 'reports'
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  scope: 'own' | 'any' | 'none'
  createdAt: string
}

export interface RoleHasPermission {
  roleId: string
  permissionId: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  token: string
  expiresIn: number
}

// User Management Types
export interface UserFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  country?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface CreateUserRequest {
  nombre: string
  apellido: string
  email: string
  password: string
  fechaNacimiento?: string
  pais?: string
  roleId: string
  status?: 'active' | 'inactive'
}

export interface UpdateUserRequest {
  nombre?: string
  apellido?: string
  email?: string
  fechaNacimiento?: string
  pais?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  status?: 'active' | 'inactive'
  roleId?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
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
  data?: Record<string, unknown>
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

export interface EventCreateRequest {
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  categoryId: string
  venueId: string
}

export interface EventUpdateRequest {
  nombre?: string
  descripcion?: string
  fechaInicio?: string
  fechaFin?: string
  categoryId?: string
  venueId?: string
}

export interface TicketTypeForm {
  name: string
  description?: string
  price: number
  quantity: number
}

export interface OrderCreateRequest {
  items: Array<{
    ticketTypeId: string
    quantity: number
  }>
  paymentMethod: 'credit_card' | 'paypal' | 'stripe'
  paymentDetails?: Record<string, unknown>
}

// API Response Types
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
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
  content: Record<string, unknown>
  failReason?: string
  sentAt?: string
  createdAt: string
}

// Dashboard and Analytics Types
export interface AdminDashboardStats {
  totalUsers: number
  activeUsers: number
  totalRoles: number
  totalPermissions: number
  roleDistribution: Array<{
    role: string
    count: number
  }>
  inactiveUsers?: number
  usersByRole?: UsersByRole
  recentRegistrations?: number
  dailyRegistrations?: DailyRegistration[]
  topCountries?: CountryStats[]
  userGrowth?: GrowthStats[]
}

export interface UsersByRole {
  admin: number
  organizer: number
  customer: number
}

export interface DailyRegistration {
  date: string
  count: number
}

export interface CountryStats {
  country: string
  count: number
  percentage: number
}

export interface GrowthStats {
  period: string
  users: number
  growth: number
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  details: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: User
}

export interface AuditLog {
  id: string
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  resource: 'USER' | 'ROLE' | 'PERMISSION'
  resourceId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: User
}

// Quick Action Types
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  action: () => void
  permissions?: string[]
}

// Data Table Types
export interface DataTableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, item: T) => React.ReactNode
}

export interface DataTableFilter {
  key: string
  value: unknown
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in'
}

export interface DataTableSort {
  key: string
  direction: 'asc' | 'desc'
}

// Development Types for Quick Testing
export interface DevUser {
  role: 'admin' | 'organizer' | 'customer'
  email: string
  token: string
  user: User
}

// Export/Import Types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  fields: string[]
  filters?: UserFilters
}

export interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: unknown
}