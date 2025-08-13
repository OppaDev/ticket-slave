'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { eventsAPI, categoriesAPI, venuesAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { Category, Venue, EventUpdateRequest, Event } from '@/types'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  
  const [formData, setFormData] = useState<EventUpdateRequest>({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    categoryId: '',
    venueId: '',
    imagenUrl: '',
  })

  const [errors, setErrors] = useState<Partial<EventUpdateRequest>>({})
  const [apiError, setApiError] = useState<ParsedError | null>(null)

  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true)
      setApiError(null)
      
      const [eventResponse, categoriesResponse, venuesResponse] = await Promise.all([
        eventsAPI.getEvent(eventId),
        categoriesAPI.getCategories(),
        venuesAPI.getVenues(),
      ])
      
      const eventData = eventResponse.data
      setEvent(eventData)
      setCategories(categoriesResponse.data)
      setVenues(venuesResponse.data)
      
      // Poblar el formulario con los datos del evento
      setFormData({
        nombre: eventData.nombre,
        descripcion: eventData.descripcion,
        fechaInicio: formatDateForInput(eventData.fechaInicio),
        fechaFin: formatDateForInput(eventData.fechaFin),
        categoryId: eventData.categoryId,
        venueId: eventData.venueId,
        imagenUrl: eventData.imagenUrl || '',
      })
      
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
    } finally {
      setInitialLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      loadInitialData()
    }
  }, [eventId, loadInitialData])

  const formatDateForInput = (dateString: string): string => {
    // Convertir fecha ISO a formato datetime-local (YYYY-MM-DDTHH:mm)
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<EventUpdateRequest> = {}

    if (formData.nombre && !formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    
    if (formData.nombre && formData.nombre.trim().length < 5) {
      newErrors.nombre = 'El nombre debe tener al menos 5 caracteres'
    }
    
    if (formData.descripcion && formData.descripcion.trim().length < 20) {
      newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres'
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      const fechaInicio = new Date(formData.fechaInicio)
      const fechaFin = new Date(formData.fechaFin)
      
      if (fechaFin <= fechaInicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})
    setApiError(null)
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // Crear objeto con solo los campos que tienen valores
      const updateData: EventUpdateRequest = {}
      
      if (formData.nombre?.trim()) {
        updateData.nombre = formData.nombre.trim()
      }
      
      if (formData.descripcion?.trim()) {
        updateData.descripcion = formData.descripcion.trim()
      }
      
      if (formData.fechaInicio) {
        updateData.fechaInicio = new Date(formData.fechaInicio).toISOString()
      }
      
      if (formData.fechaFin) {
        updateData.fechaFin = new Date(formData.fechaFin).toISOString()
      }
      
      if (formData.categoryId) {
        updateData.categoryId = formData.categoryId
      }
      
      if (formData.venueId) {
        updateData.venueId = formData.venueId
      }
      
      if (formData.imagenUrl?.trim()) {
        updateData.imagenUrl = formData.imagenUrl.trim()
      }
      
      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        router.push(`/organizer/events/${eventId}`)
        return
      }
      
      await eventsAPI.updateEvent(eventId, updateData)
      
      // Redirigir al detalle del evento
      router.push(`/organizer/events/${eventId}`)
    } catch (error) {
      const parsedError = parseApiError(error)
      setApiError(parsedError)
      
      // Si hay errores específicos de campos, mapearlos
      if (parsedError.fieldErrors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(parsedError.fieldErrors).forEach(([field, message]) => {
          fieldErrors[field] = message
        })
        // Mapear a los campos del formulario
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (field in formData) {
            setErrors(prev => ({ ...prev, [field]: message }))
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EventUpdateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (initialLoading) {
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
        
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <CardTitle>Cargando evento...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/organizer/events/${eventId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al evento
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
            <p className="text-muted-foreground">
              Modifica la información de tu evento
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert type="error" message={apiError.message} onClose={() => setApiError(null)} />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Información principal del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del evento *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Concierto de Rock 2024"
                    value={formData.nombre || ''}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe tu evento de manera atractiva para los asistentes..."
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className={errors.descripcion ? 'border-red-500' : ''}
                    rows={4}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500">{errors.descripcion}</p>
                  )}
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="imagenUrl">URL de la imagen</Label>
                  <Input
                    id="imagenUrl"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imagenUrl || ''}
                    onChange={(e) => handleInputChange('imagenUrl', e.target.value)}
                    className={errors.imagenUrl ? 'border-red-500' : ''}
                  />
                  {errors.imagenUrl && (
                    <p className="text-sm text-red-500">{errors.imagenUrl}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas del Evento</CardTitle>
                <CardDescription>
                  Define cuándo se realizará tu evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha y hora de inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="datetime-local"
                      value={formData.fechaInicio || ''}
                      onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                      className={errors.fechaInicio ? 'border-red-500' : ''}
                    />
                    {errors.fechaInicio && (
                      <p className="text-sm text-red-500">{errors.fechaInicio}</p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha y hora de fin *</Label>
                    <Input
                      id="fechaFin"
                      type="datetime-local"
                      value={formData.fechaFin || ''}
                      onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                      className={errors.fechaFin ? 'border-red-500' : ''}
                    />
                    {errors.fechaFin && (
                      <p className="text-sm text-red-500">{errors.fechaFin}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories & Venues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Categoría y Ubicación
                </CardTitle>
                <CardDescription>
                  Selecciona categoría y venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoría *</Label>
                  <Select value={formData.categoryId || ''} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500">{errors.categoryId}</p>
                  )}
                </div>

                {/* Venue */}
                <div className="space-y-2">
                  <Label htmlFor="venueId">Venue *</Label>
                  <Select value={formData.venueId || ''} onValueChange={(value) => handleInputChange('venueId', value)}>
                    <SelectTrigger className={errors.venueId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venueId && (
                    <p className="text-sm text-red-500">{errors.venueId}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar Evento
                      </>
                    )}
                  </Button>
                  
                  <Link href={`/organizer/events/${eventId}`} className="block">
                    <Button variant="outline" className="w-full" type="button">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
