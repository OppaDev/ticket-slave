'use client'

import { io, Socket } from 'socket.io-client'
import { getAuthToken } from './api'

// WebSocket endpoints through Kong Gateway
const WS_ENDPOINTS = {
  tickets: '/ws-tickets',
  events: '/ws-eventos', 
  notifications: '/ws-notifications'
} as const

type WSEndpoint = keyof typeof WS_ENDPOINTS

// Base WebSocket connection configuration
const createSocketConnection = (endpoint: WSEndpoint): Socket => {
  const token = getAuthToken()
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const socket = io(`${baseURL}${WS_ENDPOINTS[endpoint]}`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  })

  // Global error handling
  socket.on('connect_error', (error) => {
    console.error(`WebSocket connection error (${endpoint}):`, error)
  })

  socket.on('disconnect', (reason) => {
    console.log(`WebSocket disconnected (${endpoint}):`, reason)
  })

  socket.on('connect', () => {
    console.log(`WebSocket connected (${endpoint})`)
  })

  return socket
}

// Tickets WebSocket Service
export class TicketsWebSocket {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) return this.socket

    this.socket = createSocketConnection('tickets')
    
    // Set up event listeners
    this.setupEventListeners()
    
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Stock updates
    this.socket.on('stock-updated', (data) => {
      this.emit('stock-updated', data)
    })

    // Low stock alerts
    this.socket.on('low-stock-alert', (data) => {
      this.emit('low-stock-alert', data)
    })

    // Payment status
    this.socket.on('payment-status', (data) => {
      this.emit('payment-status', data)
    })

    // Tickets generated
    this.socket.on('tickets-generated', (data) => {
      this.emit('tickets-generated', data)
    })

    // Cart expiration
    this.socket.on('cart-expired', (data) => {
      this.emit('cart-expired', data)
    })

    // Ticket validation
    this.socket.on('ticket-validated', (data) => {
      this.emit('ticket-validated', data)
    })
  }

  // Join event room for stock updates
  joinEvent(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-event', eventId)
    }
  }

  // Leave event room
  leaveEvent(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-event', eventId)
    }
  }

  // Join user notifications
  joinUserNotifications() {
    if (this.socket?.connected) {
      this.socket.emit('join-user-notifications')
    }
  }

  // Add event listener
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // Remove event listener
  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  // Emit to local listeners
  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  // Send heartbeat
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping')
    }
  }
}

// Events WebSocket Service (for organizers)
export class EventsWebSocket {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) return this.socket

    this.socket = createSocketConnection('events')
    this.setupEventListeners()
    
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Sales notifications
    this.socket.on('new-sale', (data) => {
      this.emit('new-sale', data)
    })

    // Sales stats updates
    this.socket.on('sales-stats-updated', (data) => {
      this.emit('sales-stats-updated', data)
    })

    // Ticket validations
    this.socket.on('ticket-validation', (data) => {
      this.emit('ticket-validation', data)
    })

    // Event published
    this.socket.on('event-published', (data) => {
      this.emit('event-published', data)
    })

    // Event updates
    this.socket.on('event-updated', (data) => {
      this.emit('event-updated', data)
    })

    // System alerts
    this.socket.on('system-alert', (data) => {
      this.emit('system-alert', data)
    })
  }

  // Join organizer dashboard
  joinOrganizerDashboard() {
    if (this.socket?.connected) {
      this.socket.emit('join-organizer-dashboard')
    }
  }

  // Join event dashboard
  joinEventDashboard(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-event-dashboard', eventId)
    }
  }

  // Leave event dashboard
  leaveEventDashboard(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-event-dashboard', eventId)
    }
  }

  // Event listener methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping')
    }
  }
}

// Notifications WebSocket Service
export class NotificationsWebSocket {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) return this.socket

    this.socket = createSocketConnection('notifications')
    this.setupEventListeners()
    
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Push notifications
    this.socket.on('push-notification', (data) => {
      this.emit('push-notification', data)
    })

    // Email status
    this.socket.on('email-status', (data) => {
      this.emit('email-status', data)
    })

    // Critical notifications
    this.socket.on('critical-notification', (data) => {
      this.emit('critical-notification', data)
    })

    // Event update notifications
    this.socket.on('event-update-notification', (data) => {
      this.emit('event-update-notification', data)
    })

    // System notifications
    this.socket.on('system-notification', (data) => {
      this.emit('system-notification', data)
    })
  }

  // Join notifications
  joinNotifications() {
    if (this.socket?.connected) {
      this.socket.emit('join-notifications')
    }
  }

  // Subscribe to event notifications
  subscribeEventNotifications(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-event-notifications', eventId)
    }
  }

  // Unsubscribe from event notifications
  unsubscribeEventNotifications(eventId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-event-notifications', eventId)
    }
  }

  // Mark notification as read
  markNotificationRead(notificationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark-notification-read', notificationId)
    }
  }

  // Event listener methods
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping')
    }
  }
}

// Singleton instances
export const ticketsWS = new TicketsWebSocket()
export const eventsWS = new EventsWebSocket()
export const notificationsWS = new NotificationsWebSocket()