'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Minus } from 'lucide-react'

interface TicketQuantitySelectorProps {
  quantity: number
  maxQuantity: number
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TicketQuantitySelector({ 
  quantity, 
  maxQuantity, 
  onQuantityChange, 
  disabled = false,
  size = 'md'
}: TicketQuantitySelectorProps) {
  const increment = () => {
    if (quantity < maxQuantity && quantity < 8) { // Max 8 tickets per type
      onQuantityChange(quantity + 1)
    }
  }

  const decrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    const clampedValue = Math.max(0, Math.min(value, maxQuantity, 8))
    onQuantityChange(clampedValue)
  }

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm'
  const inputWidth = size === 'sm' ? 'w-12' : size === 'lg' ? 'w-16' : 'w-14'

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size={buttonSize}
        onClick={decrement}
        disabled={disabled || quantity === 0}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        min={0}
        max={Math.min(maxQuantity, 8)}
        className={`${inputWidth} h-8 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={increment}
        disabled={disabled || quantity >= maxQuantity || quantity >= 8}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface TicketTypeCardProps {
  ticketType: {
    id: string
    name: string
    price: number
    description?: string
    quantity: number
    sold: number
  }
  selectedQuantity: number
  onQuantityChange: (quantity: number) => void
  formatPrice: (price: number) => string
  showStock?: boolean
}

export function TicketTypeCard({ 
  ticketType, 
  selectedQuantity, 
  onQuantityChange, 
  formatPrice,
  showStock = true 
}: TicketTypeCardProps) {
  const available = ticketType.quantity - ticketType.sold
  const isLowStock = available <= 10 && available > 0
  const isSoldOut = available === 0

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200
      ${selectedQuantity > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
      ${isSoldOut ? 'opacity-60' : ''}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-lg">{ticketType.name}</h4>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatPrice(ticketType.price)}
          </p>
        </div>
        
        {showStock && (
          <div className="text-right">
            {isSoldOut ? (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                Agotado
              </span>
            ) : isLowStock ? (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded animate-pulse">
                ¡Solo {available}!
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {available} disponibles
              </span>
            )}
          </div>
        )}
      </div>
      
      {ticketType.description && (
        <p className="text-sm text-gray-600 mb-3">{ticketType.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-sm">
          {selectedQuantity > 0 && (
            <span className="text-blue-600 font-medium">
              Subtotal: {formatPrice(ticketType.price * selectedQuantity)}
            </span>
          )}
        </div>
        
        {!isSoldOut && (
          <TicketQuantitySelector
            quantity={selectedQuantity}
            maxQuantity={available}
            onQuantityChange={onQuantityChange}
            size="md"
          />
        )}
      </div>
      
      {selectedQuantity > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedQuantity} × {formatPrice(ticketType.price)}
            </span>
            <span className="font-medium">
              {formatPrice(ticketType.price * selectedQuantity)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}