'use client'

import { useEffect, useCallback, useRef } from 'react'
import { ticketsWS, eventsWS, notificationsWS } from '@/lib/websocket'
import { useAuth } from './use-auth'
import type { 
  WebSocketStockUpdate, 
  WebSocketPaymentStatus, 
  WebSocketSaleNotification,
  WebSocketValidation,
  WebSocketPushNotification 
} from '@/types'

// Hook for tickets WebSocket
export function useTicketsWebSocket() {
  const { isAuthenticated } = useAuth()
  const connectedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !connectedRef.current) {
      ticketsWS.connect()
      ticketsWS.joinUserNotifications()
      connectedRef.current = true
    }

    return () => {
      if (connectedRef.current) {
        ticketsWS.disconnect()
        connectedRef.current = false
      }
    }
  }, [isAuthenticated])

  const joinEvent = useCallback((eventId: string) => {
    ticketsWS.joinEvent(eventId)
  }, [])

  const leaveEvent = useCallback((eventId: string) => {
    ticketsWS.leaveEvent(eventId)
  }, [])

  const onStockUpdate = useCallback((callback: (data: WebSocketStockUpdate) => void) => {
    ticketsWS.on('stock-updated', callback)
    return () => ticketsWS.off('stock-updated', callback)
  }, [])

  const onLowStockAlert = useCallback((callback: (data: WebSocketStockUpdate) => void) => {
    ticketsWS.on('low-stock-alert', callback)
    return () => ticketsWS.off('low-stock-alert', callback)
  }, [])

  const onPaymentStatus = useCallback((callback: (data: WebSocketPaymentStatus) => void) => {
    ticketsWS.on('payment-status', callback)
    return () => ticketsWS.off('payment-status', callback)
  }, [])

  const onTicketsGenerated = useCallback((callback: (data: any) => void) => {
    ticketsWS.on('tickets-generated', callback)
    return () => ticketsWS.off('tickets-generated', callback)
  }, [])

  const onCartExpired = useCallback((callback: (data: any) => void) => {
    ticketsWS.on('cart-expired', callback)
    return () => ticketsWS.off('cart-expired', callback)
  }, [])

  const onTicketValidated = useCallback((callback: (data: WebSocketValidation) => void) => {
    ticketsWS.on('ticket-validated', callback)
    return () => ticketsWS.off('ticket-validated', callback)
  }, [])

  return {
    joinEvent,
    leaveEvent,
    onStockUpdate,
    onLowStockAlert,
    onPaymentStatus,
    onTicketsGenerated,
    onCartExpired,
    onTicketValidated,
  }
}

// Hook for events WebSocket (organizers)
export function useEventsWebSocket() {
  const { isAuthenticated, isOrganizer, isAdmin } = useAuth()
  const connectedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && (isOrganizer || isAdmin) && !connectedRef.current) {
      eventsWS.connect()
      eventsWS.joinOrganizerDashboard()
      connectedRef.current = true
    }

    return () => {
      if (connectedRef.current) {
        eventsWS.disconnect()
        connectedRef.current = false
      }
    }
  }, [isAuthenticated, isOrganizer, isAdmin])

  const joinEventDashboard = useCallback((eventId: string) => {
    eventsWS.joinEventDashboard(eventId)
  }, [])

  const leaveEventDashboard = useCallback((eventId: string) => {
    eventsWS.leaveEventDashboard(eventId)
  }, [])

  const onNewSale = useCallback((callback: (data: WebSocketSaleNotification) => void) => {
    eventsWS.on('new-sale', callback)
    return () => eventsWS.off('new-sale', callback)
  }, [])

  const onSalesStatsUpdated = useCallback((callback: (data: any) => void) => {
    eventsWS.on('sales-stats-updated', callback)
    return () => eventsWS.off('sales-stats-updated', callback)
  }, [])

  const onTicketValidation = useCallback((callback: (data: WebSocketValidation) => void) => {
    eventsWS.on('ticket-validation', callback)
    return () => eventsWS.off('ticket-validation', callback)
  }, [])

  const onEventPublished = useCallback((callback: (data: any) => void) => {
    eventsWS.on('event-published', callback)
    return () => eventsWS.off('event-published', callback)
  }, [])

  const onEventUpdated = useCallback((callback: (data: any) => void) => {
    eventsWS.on('event-updated', callback)
    return () => eventsWS.off('event-updated', callback)
  }, [])

  const onSystemAlert = useCallback((callback: (data: any) => void) => {
    eventsWS.on('system-alert', callback)
    return () => eventsWS.off('system-alert', callback)
  }, [])

  return {
    joinEventDashboard,
    leaveEventDashboard,
    onNewSale,
    onSalesStatsUpdated,
    onTicketValidation,
    onEventPublished,
    onEventUpdated,
    onSystemAlert,
  }
}

// Hook for notifications WebSocket
export function useNotificationsWebSocket() {
  const { isAuthenticated } = useAuth()
  const connectedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !connectedRef.current) {
      notificationsWS.connect()
      notificationsWS.joinNotifications()
      connectedRef.current = true
    }

    return () => {
      if (connectedRef.current) {
        notificationsWS.disconnect()
        connectedRef.current = false
      }
    }
  }, [isAuthenticated])

  const subscribeEventNotifications = useCallback((eventId: string) => {
    notificationsWS.subscribeEventNotifications(eventId)
  }, [])

  const unsubscribeEventNotifications = useCallback((eventId: string) => {
    notificationsWS.unsubscribeEventNotifications(eventId)
  }, [])

  const markNotificationRead = useCallback((notificationId: string) => {
    notificationsWS.markNotificationRead(notificationId)
  }, [])

  const onPushNotification = useCallback((callback: (data: WebSocketPushNotification) => void) => {
    notificationsWS.on('push-notification', callback)
    return () => notificationsWS.off('push-notification', callback)
  }, [])

  const onEmailStatus = useCallback((callback: (data: any) => void) => {
    notificationsWS.on('email-status', callback)
    return () => notificationsWS.off('email-status', callback)
  }, [])

  const onCriticalNotification = useCallback((callback: (data: any) => void) => {
    notificationsWS.on('critical-notification', callback)
    return () => notificationsWS.off('critical-notification', callback)
  }, [])

  const onEventUpdateNotification = useCallback((callback: (data: any) => void) => {
    notificationsWS.on('event-update-notification', callback)
    return () => notificationsWS.off('event-update-notification', callback)
  }, [])

  const onSystemNotification = useCallback((callback: (data: any) => void) => {
    notificationsWS.on('system-notification', callback)
    return () => notificationsWS.off('system-notification', callback)
  }, [])

  return {
    subscribeEventNotifications,
    unsubscribeEventNotifications,
    markNotificationRead,
    onPushNotification,
    onEmailStatus,
    onCriticalNotification,
    onEventUpdateNotification,
    onSystemNotification,
  }
}

// Combined hook for all WebSocket functionality
export function useWebSocketManager() {
  const tickets = useTicketsWebSocket()
  const events = useEventsWebSocket()
  const notifications = useNotificationsWebSocket()

  return {
    tickets,
    events,
    notifications,
  }
}