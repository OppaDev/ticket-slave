'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Save, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { venuesAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { CreateVenueRequest } from '@/types'

export default function CreateVenue() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<CreateVenueRequest>({
    nombre: '',
    direccion: '',
    ciudad: '',
    pais: '',
    latitud: null,
    longitud: null,
  })

  const [errors, setErrors] = useState<Partial<CreateVenueRequest>>({})
  const [apiError, setApiError] = useState<ParsedError | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateVenueRequest> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida'
    }

    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido'
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
      
      const response = await venuesAPI.createVenue(formData)
      
      // Redirigir al recinto creado
      router.push(`/organizer/venues/${response.data.id}`)
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

  const handleInputChange = (field: keyof CreateVenueRequest, value: string | number | null) => {
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
          <Link href="/organizer/venues">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Recinto</h1>
            <p className="text-gray-600">Agrega un nuevo lugar para tus eventos</p>
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
                  <Building className="w-5 h-5 mr-2" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Datos principales del recinto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Recinto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Estadio Nacional, Teatro Principal"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Ej: Av. Principal 123"
                    className={errors.direccion ? 'border-red-500' : ''}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-600">{errors.direccion}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      placeholder="Ej: Quito"
                      className={errors.ciudad ? 'border-red-500' : ''}
                    />
                    {errors.ciudad && (
                      <p className="text-sm text-red-600">{errors.ciudad}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pais">País *</Label>
                    <Input
                      id="pais"
                      value={formData.pais}
                      onChange={(e) => handleInputChange('pais', e.target.value)}
                      placeholder="Ej: EC"
                      className={errors.pais ? 'border-red-500' : ''}
                    />
                    {errors.pais && (
                      <p className="text-sm text-red-600">{errors.pais}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Coordinates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Coordenadas (Opcional)
                </CardTitle>
                <CardDescription>
                  Ubicación exacta del recinto para mapas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitud">Latitud</Label>
                    <Input
                      id="latitud"
                      type="number"
                      step="any"
                      value={formData.latitud || ''}
                      onChange={(e) => handleInputChange('latitud', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Ej: -0.1764"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitud">Longitud</Label>
                    <Input
                      id="longitud"
                      type="number"
                      step="any"
                      value={formData.longitud || ''}
                      onChange={(e) => handleInputChange('longitud', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Ej: -78.4784"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      Crear Recinto
                    </>
                  )}
                </Button>
                
                <Link href="/organizer/venues" className="block">
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
