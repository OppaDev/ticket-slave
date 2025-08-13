'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { useTicketsWebSocket } from '@/hooks/use-websocket'
import { Zap, AlertTriangle } from 'lucide-react'
import type { TicketType } from '@/types'

interface StockIndicatorProps {
  ticketType: TicketType
  eventId: string
  showAnimation?: boolean
}

export function StockIndicator({ ticketType, eventId, showAnimation = true }: StockIndicatorProps) {
  const [stock, setStock] = useState(ticketType.quantity - ticketType.sold)
  const [isUpdating, setIsUpdating] = useState(false)
  const { onStockUpdate } = useTicketsWebSocket()

  useEffect(() => {
    const cleanup = onStockUpdate((data) => {
      if (data.eventId === eventId && data.ticketTypeId === ticketType.id) {
        setStock(data.available)
        
        if (showAnimation) {
          setIsUpdating(true)
          setTimeout(() => setIsUpdating(false), 1000)
        }
      }
    })

    return cleanup
  }, [eventId, ticketType.id, onStockUpdate, showAnimation])

  const getStockStatus = () => {
    if (stock === 0) return { variant: 'destructive' as const, text: 'Agotado', icon: AlertTriangle }
    if (stock <= 5) return { variant: 'destructive' as const, text: `¡Solo ${stock}!`, icon: AlertTriangle }
    if (stock <= 20) return { variant: 'secondary' as const, text: `${stock} disponibles`, icon: Zap }
    return { variant: 'outline' as const, text: `${stock} disponibles`, icon: null }
  }

  const status = getStockStatus()
  const Icon = status.icon

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={status.variant}
        className={`
          transition-all duration-300 
          ${isUpdating ? 'scale-110 ring-2 ring-blue-400' : ''} 
          ${stock <= 5 ? 'animate-pulse' : ''}
        `}
      >
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.text}
      </Badge>
      
      {isUpdating && (
        <div className="flex items-center text-xs text-blue-600">
          <Zap className="h-3 w-3 mr-1 animate-pulse" />
          Actualizado
        </div>
      )}
    </div>
  )
}

interface LiveStockCounterProps {
  initialStock: number
  eventId: string
  ticketTypeId: string
  className?: string
}

export function LiveStockCounter({ initialStock, eventId, ticketTypeId, className = '' }: LiveStockCounterProps) {
  const [stock, setStock] = useState(initialStock)
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const { onStockUpdate } = useTicketsWebSocket()

  useEffect(() => {
    const cleanup = onStockUpdate((data) => {
      if (data.eventId === eventId && data.ticketTypeId === ticketTypeId) {
        const newStock = data.available
        setTrend(newStock > stock ? 'up' : newStock < stock ? 'down' : 'stable')
        setStock(newStock)
      }
    })

    return cleanup
  }, [eventId, ticketTypeId, stock, onStockUpdate])

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className={`
        font-mono font-bold transition-colors duration-300
        ${trend === 'down' ? 'text-red-600' : trend === 'up' ? 'text-green-600' : 'text-gray-700'}
      `}>
        {stock}
      </span>
      <span className="text-sm text-gray-500">disponibles</span>
      
      {trend !== 'stable' && (
        <div className={`
          w-2 h-2 rounded-full animate-pulse
          ${trend === 'down' ? 'bg-red-400' : 'bg-green-400'}
        `} />
      )}
    </div>
  )
}