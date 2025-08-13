'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, ArrowLeft, Calendar, Hash, Building, MapPin, Globe, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { venuesAPI } from '@/lib/api'
import type { Venue } from '@/types'

export default function VenueDetail() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)

  const loadVenue = useCallback(async (venueId: string) => {
    try {
      setLoading(true)
      const response = await venuesAPI.getVenue(venueId)
      setVenue(response.data)
    } catch (error) {
      console.error('Error loading venue:', error)
      router.push('/organizer/venues')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (params.id) {
      loadVenue(params.id as string)
    }
  }, [params.id, loadVenue])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recinto no encontrado</h3>
              <p className="text-gray-600 mb-6">
                El recinto que buscas no existe o ha sido eliminado.
              </p>
              <Link href="/organizer/venues">
                <Button>Volver a recintos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/organizer/venues">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{venue.nombre}</h1>
            <p className="text-gray-600">Detalles del recinto</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/venues/${venue.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar recinto
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">ID</label>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4 text-gray-400" />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{venue.id}</code>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-lg font-medium">{venue.nombre}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-700">Dirección</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{venue.direccion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Ciudad</label>
                <p className="mt-1 text-gray-900">{venue.ciudad}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">País</label>
                <p className="mt-1 text-gray-900">{venue.pais}</p>
              </div>
            </div>
            
            {(venue.latitud && venue.longitud) && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Coordenadas GPS</label>
                  <div className="mt-1 text-gray-900 font-mono text-sm">
                    <p>Latitud: {venue.latitud.toFixed(6)}</p>
                    <p>Longitud: {venue.longitud.toFixed(6)}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Zonas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Zonas del recinto
              <Badge variant="secondary" className="ml-2">
                {venue.zones?.length || 0} zona(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {venue.zones && venue.zones.length > 0 ? (
              <div className="grid gap-3">
                {venue.zones.map((zone) => (
                  <div key={zone.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{zone.nombre}</h4>
                        <p className="text-sm text-gray-600">Capacidad: {zone.capacidad}</p>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{zone.id}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No hay zonas configuradas para este recinto</p>
                <p className="text-sm text-gray-500 mt-1">
                  Las zonas se pueden agregar al editar el recinto
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Información adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de creación</label>
              <p className="mt-1 text-gray-900">
                {new Date(venue.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-700">Organizador ID</label>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded ml-2">{venue.organizerId}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
