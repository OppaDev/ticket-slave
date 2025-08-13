'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { eventsAPI, ticketsAPI } from '@/lib/api'
import { useTicketsWebSocket } from '@/hooks/use-websocket'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart,
  Ticket,
  Building,
  Globe,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react'
import type { Event, TicketType, Venue } from '@/types'
import Link from 'next/link'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})

  const { joinEvent, leaveEvent, onStockUpdate, onLowStockAlert } = useTicketsWebSocket()

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)
        const [eventResponse, ticketTypesResponse] = await Promise.all([
          eventsAPI.getEvent(eventId),
          ticketsAPI.getTicketTypes(eventId)
        ])
        
        const eventData = eventResponse.data
        setEvent(eventData)
        setTicketTypes(ticketTypesResponse.data)

        // Fetch venue details if available
        if (eventData.venueId) {
          try {
            const venueResponse = await eventsAPI.getVenues() // You might need to adjust this to get specific venue
            const venues = venueResponse.data
            const eventVenue = venues.find((v: Venue) => v.id === eventData.venueId)
            if (eventVenue) setVenue(eventVenue)
          } catch {
            console.log('Could not fetch venue details')
          }
        }
      } catch (error: unknown) {
        console.error('Error fetching event:', error)
        toast.error('Error al cargar el evento')
        router.push('/events')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId, router])

  // WebSocket setup for real-time updates
  useEffect(() => {
    if (eventId) {
      joinEvent(eventId)
      
      const stockCleanup = onStockUpdate((data) => {
        if (data.eventId === eventId) {
          setTicketTypes(prev => prev.map(tt => 
            tt.id === data.ticketTypeId 
              ? { ...tt, quantity: data.available + data.sold, sold: data.sold }
              : tt
          ))
        }
      })

      const lowStockCleanup = onLowStockAlert((data) => {
        if (data.eventId === eventId) {
          toast.warning(`¡Solo quedan ${data.available} tickets de ${data.ticketTypeName}!`)
        }
      })

      return () => {
        leaveEvent(eventId)
        stockCleanup()
        lowStockCleanup()
      }
    }
  }, [eventId, joinEvent, leaveEvent, onStockUpdate, onLowStockAlert])

  const updateTicketQuantity = (ticketTypeId: string, change: number) => {
    setSelectedTickets(prev => {
      const current = prev[ticketTypeId] || 0
      const newQuantity = Math.max(0, current + change)
      return { ...prev, [ticketTypeId]: newQuantity }
    })
  }

  const getAvailableStock = (ticketType: TicketType) => {
    return ticketType.quantity - ticketType.sold
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalPrice = () => {
    return ticketTypes.reduce((total, tt) => {
      const quantity = selectedTickets[tt.id] || 0
      return total + (tt.price * quantity)
    }, 0)
  }

  const shareEvent = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.nombre,
          text: event.descripcion,
          url: window.location.href
        })
      } catch {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        toast.success('URL copiada al portapapeles')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('URL copiada al portapapeles')
    }
  }

  const addToCalendar = () => {
    if (!event) return
    
    const startDate = new Date(event.fechaInicio).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = new Date(event.fechaFin).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.nombre)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.descripcion)}&location=${encodeURIComponent(venue?.nombre || '')}`
    
    window.open(calendarUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600 mb-4">El evento que buscas no existe o no está disponible</p>
          <Link href="/events">
            <Button>Volver a eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a eventos
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareEvent}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Hero */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold mb-2">{event.nombre}</CardTitle>
                    <CardDescription className="text-lg">
                      {event.category?.nombre}
                    </CardDescription>
                  </div>
                  <Badge variant={event.status === 'PUBLICADO' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-medium">Fecha y hora</p>
                        <p className="text-sm">{formatDate(event.fechaInicio)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-3 text-red-600" />
                      <div>
                        <p className="font-medium">{venue?.nombre || 'Venue por confirmar'}</p>
                        <p className="text-sm">{venue?.direccion}, {venue?.ciudad}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-5 w-5 mr-3 text-green-600" />
                      <div>
                        <p className="font-medium">Organizador</p>
                        <p className="text-sm">{event.organizer?.nombre || 'Organizador'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-5 w-5 mr-3 text-purple-600" />
                      <div>
                        <p className="font-medium">Duración</p>
                        <p className="text-sm">
                          {Math.ceil((new Date(event.fechaFin).getTime() - new Date(event.fechaInicio).getTime()) / (1000 * 60 * 60))} horas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Event Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Descripción del evento</h3>
                  <p className="text-gray-700 leading-relaxed">{event.descripcion}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={addToCalendar} variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agregar al calendario
                  </Button>
                  <Button variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Ver en mapa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            {venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Información del Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Ubicación</h4>
                      <p className="text-gray-700">{venue.direccion}</p>
                      <p className="text-gray-700">{venue.ciudad}, {venue.pais}</p>
                    </div>
                    {venue.zones && venue.zones.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Zonas disponibles</h4>
                        <div className="space-y-1">
                          {venue.zones.map((zone) => (
                            <div key={zone.id} className="flex justify-between text-sm">
                              <span>{zone.nombre}</span>
                              <span className="text-gray-500">Capacidad: {zone.capacidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Ticket Selection */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Seleccionar Tickets
                </CardTitle>
                <CardDescription>
                  Elige el tipo y cantidad de tickets
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {ticketTypes.length > 0 ? (
                  <>
                    {ticketTypes.map((ticketType) => {
                      const available = getAvailableStock(ticketType)
                      const selected = selectedTickets[ticketType.id] || 0
                      
                      return (
                        <div key={ticketType.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{ticketType.name}</h4>
                              <p className="text-2xl font-bold text-blue-600">
                                {formatPrice(ticketType.price)}
                              </p>
                            </div>
                            {available <= 10 && available > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                ¡Solo {available}!
                              </Badge>
                            )}
                          </div>
                          
                          {ticketType.description && (
                            <p className="text-sm text-gray-600">{ticketType.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {available > 0 ? `${available} disponibles` : 'Agotado'}
                            </span>
                            
                            {available > 0 && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                  disabled={selected === 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {selected}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                  disabled={selected >= available || selected >= 8}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {getTotalSelectedTickets() > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total ({getTotalSelectedTickets()} tickets)</span>
                            <span className="text-xl font-bold text-blue-600">
                              {formatPrice(getTotalPrice())}
                            </span>
                          </div>
                          
                          <Button className="w-full" size="lg">
                            Agregar al Carrito
                          </Button>
                          
                          <p className="text-xs text-gray-500 text-center">
                            Los tickets se reservarán por 15 minutos
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay tipos de ticket disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}