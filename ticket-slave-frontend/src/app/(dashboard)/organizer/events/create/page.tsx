'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Tag, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { eventsAPI, categoriesAPI, venuesAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { Category, Venue, CreateEventRequest } from '@/types'

export default function CreateEvent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  
  const [formData, setFormData] = useState<CreateEventRequest>({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    categoryId: '',
    venueId: '',
    imagenUrl: '',
  })

  const [errors, setErrors] = useState<Partial<CreateEventRequest>>({})
  const [apiError, setApiError] = useState<ParsedError | null>(null)

  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      const [categoriesResponse, venuesResponse] = await Promise.all([
        categoriesAPI.getCategories(),
        venuesAPI.getVenues(),
      ])
      
      setCategories(categoriesResponse.data)
      setVenues(venuesResponse.data)
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEventRequest> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida'
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida'
    }

    if (formData.fechaInicio && formData.fechaFin) {
      const startDate = new Date(formData.fechaInicio)
      const endDate = new Date(formData.fechaFin)
      
      if (startDate >= endDate) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'La categoría es requerida'
    }

    if (!formData.venueId) {
      newErrors.venueId = 'El recinto es requerido'
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
      
      // Convertir fechas al formato que espera la API
      const eventData = {
        ...formData,
        fechaInicio: formData.fechaInicio.split('T')[0], // Solo la fecha YYYY-MM-DD
        fechaFin: formData.fechaFin.split('T')[0],
      }

      const response = await eventsAPI.createEvent(eventData)
      
      // Redirigir al evento creado
      router.push(`/organizer/events/${response.data.id}`)
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

  const handleInputChange = (field: keyof CreateEventRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/organizer/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
            <p className="text-gray-600">Completa la información de tu evento</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert
          title={apiError.title}
          message={apiError.message}
          type="error"
          onClose={() => setApiError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Datos principales del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Evento *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Concierto de Rock 2025"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describe tu evento..."
                    rows={4}
                    className={errors.descripcion ? 'border-red-500' : ''}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-600">{errors.descripcion}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagenUrl">URL de Imagen</Label>
                  <Input
                    id="imagenUrl"
                    type="url"
                    value={formData.imagenUrl}
                    onChange={(e) => handleInputChange('imagenUrl', e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas y Horarios</CardTitle>
                <CardDescription>
                  Define cuándo se realizará tu evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha y Hora de Inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="datetime-local"
                      value={formData.fechaInicio}
                      onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                      className={errors.fechaInicio ? 'border-red-500' : ''}
                    />
                    {errors.fechaInicio && (
                      <p className="text-sm text-red-600">{errors.fechaInicio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha y Hora de Fin *</Label>
                    <Input
                      id="fechaFin"
                      type="datetime-local"
                      value={formData.fechaFin}
                      onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                      className={errors.fechaFin ? 'border-red-500' : ''}
                    />
                    {errors.fechaFin && (
                      <p className="text-sm text-red-600">{errors.fechaFin}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category and Venue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Categoría y Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoría *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
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
                    <p className="text-sm text-red-600">{errors.categoryId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueId">Recinto *</Label>
                  <Select 
                    value={formData.venueId} 
                    onValueChange={(value) => handleInputChange('venueId', value)}
                  >
                    <SelectTrigger className={errors.venueId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un recinto" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          <div>
                            <div className="font-medium">{venue.nombre}</div>
                            <div className="text-sm text-gray-500">
                              {venue.ciudad}, {venue.pais}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venueId && (
                    <p className="text-sm text-red-600">{errors.venueId}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Evento
                    </>
                  )}
                </Button>
                
                <Link href="/organizer/events" className="block">
                  <Button variant="outline" className="w-full" type="button">
                    Cancelar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
