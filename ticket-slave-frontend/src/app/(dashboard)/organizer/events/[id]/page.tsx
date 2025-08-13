'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, CheckCircle, Clock, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { eventsAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { Event } from '@/types'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<ParsedError | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    loading: boolean
  }>({
    open: false,
    loading: false
  })

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true)
      setApiError(null)
      const response = await eventsAPI.getEvent(eventId)
      setEvent(response.data)
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId, loadEvent])

  const handleDeleteEvent = async () => {
    if (!event) return

    try {
      setDeleteDialog(prev => ({ ...prev, loading: true }))
      await eventsAPI.deleteEvent(event.id)
      
      // Redirigir a la lista de eventos
      router.push('/organizer/events')
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    } finally {
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handlePublishEvent = async () => {
    if (!event) return

    try {
      await eventsAPI.publishEvent(event.id)
      
      // Actualizar el evento local
      setEvent(prev => prev ? { ...prev, status: 'PUBLICADO' as const } : null)
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    }
  }

  const getEventStatus = (status: string) => {
    if (status === 'PUBLICADO') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" />
          Publicado
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-4 w-4 mr-1" />
        Borrador
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/organizer/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a eventos
            </Button>
          </Link>
        </div>
        
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (apiError && !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/organizer/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a eventos
            </Button>
          </Link>
        </div>
        
        <Alert type="error" message={apiError.message} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/organizer/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a eventos
            </Button>
          </Link>
        </div>
        
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Evento no encontrado</h3>
            <p className="text-muted-foreground">
              El evento que buscas no existe o ha sido eliminado.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/organizer/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a eventos
          </Button>
        </Link>
        
        <div className="flex items-center space-x-2">
          {event.status !== 'PUBLICADO' && (
            <Button onClick={handlePublishEvent}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Publicar Evento
            </Button>
          )}
          
          <Link href={`/organizer/events/${event.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={() => setDeleteDialog({ open: true, loading: false })}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert type="error" message={apiError.message} onClose={() => setApiError(null)} />
      )}

      {/* Event Image */}
      {event.imagenUrl && (
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <Image
            src={event.imagenUrl}
            alt={event.nombre}
            className="object-cover"
            fill
          />
        </div>
      )}

      {/* Event Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">{event.nombre}</h1>
              {getEventStatus(event.status)}
            </div>
            <p className="text-lg text-muted-foreground">{event.descripcion}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Event Details Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Fechas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Fechas del Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
              <p className="text-sm">{formatDate(event.fechaInicio)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(event.fechaInicio)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de finalización</p>
              <p className="text-sm">{formatDate(event.fechaFin)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(event.fechaFin)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Venue */}
        {event.venue && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{event.venue.nombre}</p>
                <p className="text-sm text-muted-foreground">{event.venue.direccion}</p>
                {event.venue.ciudad && (
                  <p className="text-sm text-muted-foreground">{event.venue.ciudad}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category */}
        {event.category && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{event.category.nombre}</p>
              {event.category.descripcion && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.category.descripcion}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID del Evento</p>
              <p className="text-sm font-mono">{event.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estado</p>
              <p className="text-sm">{event.status === 'PUBLICADO' ? 'Publicado' : 'Borrador'}</p>
            </div>
            {event.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                <p className="text-sm">{formatDate(event.createdAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => !deleteDialog.loading && setDeleteDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar evento?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el evento &quot;{event.nombre}&quot;.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, loading: false })}
              disabled={deleteDialog.loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={deleteDialog.loading}
            >
              {deleteDialog.loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
