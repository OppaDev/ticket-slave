// Configuration constants for the application

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001',
    timeout: 10000,
  },

  // Microservices Configuration
  microservices: {
    users: {
      baseUrl: process.env.NEXT_PUBLIC_USERS_API_URL || 'http://localhost:8000/api/v1',
    },
    events: {
      baseUrl: process.env.NEXT_PUBLIC_EVENTS_API_URL || 'http://localhost:8000/api/v1',
    },
    tickets: {
      baseUrl: process.env.NEXT_PUBLIC_TICKETS_API_URL || 'http://localhost:8000/api/v1',
    },
  },

  // Development Configuration
  development: {
    enabled: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    showDevPanel: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    users: {
      admin: {
        email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || 'admin@test.com',
        token: process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN || '',
        password: process.env.NEXT_PUBLIC_DEV_DEFAULT_PASSWORD || 'password',
      },
      organizer: {
        email: process.env.NEXT_PUBLIC_DEV_ORGANIZER_EMAIL || 'organizer@test.com',
        token: process.env.NEXT_PUBLIC_DEV_ORGANIZER_TOKEN || '',
        password: process.env.NEXT_PUBLIC_DEV_DEFAULT_PASSWORD || 'password',
      },
      customer: {
        email: process.env.NEXT_PUBLIC_DEV_CUSTOMER_EMAIL || 'customer@test.com',
        token: process.env.NEXT_PUBLIC_DEV_CUSTOMER_TOKEN || '',
        password: process.env.NEXT_PUBLIC_DEV_DEFAULT_PASSWORD || 'password',
      },
    },
  },

  // Application Configuration
  app: {
    name: 'Ticket Slave',
    description: 'Sistema de gestión de eventos y tickets',
    version: '1.0.0',
    supportEmail: 'soporte@ticketslave.com',
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    maxPageSize: 100,
  },

  // File upload limits
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
  },

  // Date and time formats
  formats: {
    date: 'dd/MM/yyyy',
    dateTime: 'dd/MM/yyyy HH:mm',
    time: 'HH:mm',
    currency: 'es-ES',
  },

  // Role configuration
  roles: {
    admin: {
      name: 'admin',
      label: 'Administrador',
      description: 'Acceso total al sistema',
      color: 'purple',
      redirectTo: '/dashboard',
    },
    organizer: {
      name: 'organizer',
      label: 'Organizador',
      description: 'Gestiona eventos y tickets',
      color: 'blue',
      redirectTo: '/dashboard',
    },
    customer: {
      name: 'customer',
      label: 'Cliente',
      description: 'Compra tickets y eventos',
      color: 'green',
      redirectTo: '/events',
    },
  },

  // Dashboard configuration
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    charts: {
      animationDuration: 1000,
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
      },
    },
  },

  // WebSocket configuration
  websocket: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
  },

  // Validation rules
  validation: {
    password: {
      minLength: 6,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      pattern: /^[+]?[\d\s\-\(\)]+$/,
    },
  },

  // Cache configuration
  cache: {
    userProfile: 5 * 60 * 1000, // 5 minutes
    permissions: 10 * 60 * 1000, // 10 minutes
    events: 2 * 60 * 1000, // 2 minutes
  },

  // Feature flags
  features: {
    enableExports: true,
    enableImports: true,
    enableAuditLogs: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableWebSocket: true,
  },
} as const

// Helper functions
export const isDevelopment = () => config.development.enabled
export const isProduction = () => process.env.NODE_ENV === 'production'
export const getApiUrl = (path: string = '') => `${config.api.baseUrl}${path}`
export const getRoleConfig = (roleName: string) => config.roles[roleName as keyof typeof config.roles]
export const getDevUser = (role: 'admin' | 'organizer' | 'customer') => config.development.users[role]

export default config
