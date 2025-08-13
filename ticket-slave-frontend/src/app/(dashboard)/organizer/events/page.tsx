'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, MapPin, Users, Edit, Eye, CheckCircle, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { eventsAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { Event } from '@/types'

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [apiError, setApiError] = useState<ParsedError | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const filteredEvents = events.filter(event =>
    event.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setApiError(null)
      const response = await eventsAPI.getEvents()
      setEvents(response.data)
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishEvent = async (event: Event) => {
    try {
      await eventsAPI.publishEvent(event.id)
      
      // Actualizar el evento en la lista local
      setEvents(prev => prev.map(e => 
        e.id === event.id 
          ? { ...e, status: 'PUBLICADO' as const }
          : e
      ))
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    }
  }

  const getEventStatus = (event: Event) => {
    if (event.status === 'PUBLICADO') {
      return <Badge variant="default" className="bg-green-500">Publicado</Badge>
    }
    return <Badge variant="secondary">Borrador</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
            <p className="text-muted-foreground">
              Gestiona todos tus eventos desde aquí
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['organizer']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
            <p className="text-muted-foreground">
              Gestiona todos tus eventos desde aquí
            </p>
          </div>
          <Link href="/organizer/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {apiError && (
          <Alert type="error" message={apiError.message} onClose={() => setApiError(null)} />
        )}

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron eventos' : 'No tienes eventos creados'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Prueba con otros términos de búsqueda'
                  : 'Crea tu primer evento para empezar a gestionar entradas'
                }
              </p>
              {!searchTerm && (
                <Link href="/organizer/events/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Evento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.imagenUrl && !imageErrors.has(event.id) ? (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={event.imagenUrl}
                      alt={event.nombre}
                      className="object-cover"
                      fill
                      onError={() => handleImageError(event.id)}
                    />
                  </div>
                ) : event.imagenUrl && imageErrors.has(event.id) ? (
                  <div className="aspect-video relative overflow-hidden bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Imagen no disponible</p>
                    </div>
                  </div>
                ) : null}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{event.nombre}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {event.descripcion}
                      </CardDescription>
                    </div>
                    {getEventStatus(event)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Event Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(event.fechaInicio)} - {formatDate(event.fechaFin)}
                      </span>
                    </div>
                    
                    {event.venue && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{event.venue.nombre}</span>
                      </div>
                    )}
                    
                    {event.category && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.category.nombre}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Link href={`/organizer/events/${event.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    
                    {event.status !== 'PUBLICADO' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishEvent(event)}
                        className="ml-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publicar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
