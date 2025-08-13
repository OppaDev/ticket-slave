'use client'

import { 
  Calendar, 
  Users, 
  Building,
  Globe,
  Star,
  Heart,
  Share2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventInfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
  description?: string
  color?: string
}

export function EventInfoItem({ icon, label, value, description, color = 'blue' }: EventInfoItemProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex items-start space-x-3">
      <div className={`${colorClasses[color as keyof typeof colorClasses]} mt-1`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}

interface EventActionButtonsProps {
  onShare: () => void
  onSave: () => void
  onAddToCalendar: () => void
  onViewMap?: () => void
  isSaved?: boolean
}

export function EventActionButtons({ 
  onShare, 
  onSave, 
  onAddToCalendar, 
  onViewMap,
  isSaved = false 
}: EventActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onAddToCalendar} variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        Agregar al calendario
      </Button>
      
      <Button onClick={onShare} variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Compartir
      </Button>
      
      <Button onClick={onSave} variant="outline" size="sm">
        <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
        {isSaved ? 'Guardado' : 'Guardar'}
      </Button>
      
      {onViewMap && (
        <Button onClick={onViewMap} variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          Ver en mapa
        </Button>
      )}
    </div>
  )
}

interface EventStatsProps {
  ticketTypes: number
  totalCapacity?: number
  soldTickets?: number
  priceRange?: { min: number; max: number }
  formatPrice: (price: number) => string
}

export function EventStats({ 
  ticketTypes, 
  totalCapacity, 
  soldTickets, 
  priceRange,
  formatPrice 
}: EventStatsProps) {
  const salesPercentage = totalCapacity && soldTickets 
    ? Math.round((soldTickets / totalCapacity) * 100) 
    : 0

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-gray-900">Estadísticas del evento</h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Tipos de ticket</span>
          <p className="font-medium">{ticketTypes}</p>
        </div>
        
        {priceRange && (
          <div>
            <span className="text-gray-600">Rango de precios</span>
            <p className="font-medium">
              {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </p>
          </div>
        )}
        
        {totalCapacity && (
          <div>
            <span className="text-gray-600">Capacidad</span>
            <p className="font-medium">{totalCapacity.toLocaleString()} personas</p>
          </div>
        )}
        
        {soldTickets && totalCapacity && (
          <div>
            <span className="text-gray-600">Vendidos</span>
            <p className="font-medium">{salesPercentage}% ({soldTickets.toLocaleString()})</p>
          </div>
        )}
      </div>
      
      {soldTickets && totalCapacity && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Disponibilidad</span>
            <span>{100 - salesPercentage}% disponible</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${salesPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface VenueInfoCardProps {
  venue: {
    nombre: string
    direccion: string
    ciudad: string
    pais: string
    zones?: Array<{
      id: string
      nombre: string
      capacidad: number
    }>
  }
}

export function VenueInfoCard({ venue }: VenueInfoCardProps) {
  const totalCapacity = venue.zones?.reduce((sum, zone) => sum + zone.capacidad, 0)

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Building className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold">Información del Venue</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Ubicación</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-medium">{venue.nombre}</p>
            <p>{venue.direccion}</p>
            <p>{venue.ciudad}, {venue.pais}</p>
          </div>
          
          {totalCapacity && (
            <div className="mt-3">
              <span className="text-sm text-gray-600">Capacidad total: </span>
              <span className="font-medium">{totalCapacity.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {venue.zones && venue.zones.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Zonas disponibles</h4>
            <div className="space-y-2">
              {venue.zones.map((zone) => (
                <div key={zone.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">{zone.nombre}</span>
                  <Badge variant="outline">
                    {zone.capacidad.toLocaleString()} personas
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface OrganizerInfoProps {
  organizer: {
    nombre?: string
    apellido?: string
    email?: string
  }
  rating?: number
  totalEvents?: number
}

export function OrganizerInfo({ organizer, rating, totalEvents }: OrganizerInfoProps) {
  const organizerName = organizer.nombre 
    ? `${organizer.nombre} ${organizer.apellido || ''}`.trim()
    : 'Organizador'

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold">Organizador</h3>
      </div>
      
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{organizerName}</h4>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            {rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            
            {totalEvents && (
              <span>{totalEvents} eventos organizados</span>
            )}
          </div>
          
          <Button variant="outline" size="sm" className="mt-3">
            Ver perfil del organizador
          </Button>
        </div>
      </div>
    </div>
  )
}