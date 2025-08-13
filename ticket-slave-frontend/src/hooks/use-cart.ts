'use client'

import { useState, useEffect, useCallback } from 'react'
import { ticketsAPI } from '@/lib/api'
import { useTicketsWebSocket } from './use-websocket'
import { toast } from 'sonner'
import type { Cart, CartItem } from '@/types'

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const { onCartExpired } = useTicketsWebSocket()

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const response = await ticketsAPI.getCart()
      setCart(response.data)
      
      // Calculate time left
      if (response.data?.expiresAt) {
        const expiration = new Date(response.data.expiresAt).getTime()
        const now = new Date().getTime()
        setTimeLeft(Math.max(0, Math.floor((expiration - now) / 1000)))
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching cart:', error)
      }
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add items to cart
  const addToCart = useCallback(async (items: { ticketTypeId: string; quantity: number }[]) => {
    try {
      setLoading(true)
      await ticketsAPI.addToCart(items)
      await fetchCart()
      toast.success('Tickets agregados al carrito')
      return true
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Error al agregar tickets al carrito')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setLoading(true)
      await ticketsAPI.removeFromCart(itemId)
      await fetchCart()
      toast.success('Ticket removido del carrito')
    } catch (error: any) {
      console.error('Error removing from cart:', error)
      toast.error('Error al remover ticket del carrito')
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true)
      await ticketsAPI.clearCart()
      setCart(null)
      setTimeLeft(0)
      toast.success('Carrito vaciado')
    } catch (error: any) {
      console.error('Error clearing cart:', error)
      toast.error('Error al vaciar carrito')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity === 0) {
      return removeFromCart(itemId)
    }

    try {
      setLoading(true)
      // Remove and re-add with new quantity
      await ticketsAPI.removeFromCart(itemId)
      
      const item = cart?.items.find(i => i.id === itemId)
      if (item) {
        await ticketsAPI.addToCart([{ ticketTypeId: item.ticketTypeId, quantity }])
      }
      
      await fetchCart()
      toast.success('Cantidad actualizada')
    } catch (error: any) {
      console.error('Error updating quantity:', error)
      toast.error('Error al actualizar cantidad')
    } finally {
      setLoading(false)
    }
  }, [cart, fetchCart, removeFromCart])

  // Calculate totals
  const getTotalItems = useCallback(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0
  }, [cart])

  const getTotalPrice = useCallback(() => {
    return cart?.items.reduce((total, item) => total + (item.priceAtReservation * item.quantity), 0) || 0
  }, [cart])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCart(null)
            toast.error('Tu carrito ha expirado. Los tickets han sido liberados.')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [timeLeft])

  // WebSocket cart expiration
  useEffect(() => {
    const cleanup = onCartExpired(() => {
      setCart(null)
      setTimeLeft(0)
      toast.error('Tu carrito ha expirado. Los tickets han sido liberados.')
    })

    return cleanup
  }, [onCartExpired])

  // Format time left
  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [timeLeft])

  // Check if cart is expired
  const isExpired = useCallback(() => {
    return timeLeft <= 0 && cart !== null
  }, [timeLeft, cart])

  // Initialize cart on mount
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return {
    cart,
    loading,
    timeLeft,
    formatTimeLeft,
    isExpired,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice
  }
}

// Hook for cart summary component
export function useCartSummary() {
  const {
    cart,
    loading,
    timeLeft,
    formatTimeLeft,
    isExpired,
    getTotalItems,
    getTotalPrice,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getItemsGroupedByEvent = () => {
    if (!cart?.items) return []

    const grouped = cart.items.reduce((acc, item) => {
      const eventId = item.ticketType?.eventId
      if (!eventId) return acc

      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          eventName: item.ticketType?.event?.nombre || 'Evento',
          items: []
        }
      }

      acc[eventId].items.push(item)
      return acc
    }, {} as Record<string, { eventId: string; eventName: string; items: CartItem[] }>)

    return Object.values(grouped)
  }

  return {
    cart,
    loading,
    timeLeft,
    formatTimeLeft,
    isExpired,
    getTotalItems,
    getTotalPrice,
    formatPrice,
    getItemsGroupedByEvent,
    removeFromCart,
    updateQuantity,
    clearCart
  }
}