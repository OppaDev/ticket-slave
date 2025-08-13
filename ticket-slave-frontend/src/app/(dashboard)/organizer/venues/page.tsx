'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Search, Eye, Edit, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { venuesAPI } from '@/lib/api'
import type { Venue } from '@/types'

export default function VenuesManagement() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadVenues()
  }, [])

  const filterVenues = useCallback(() => {
    let filtered = venues

    if (searchTerm) {
      filtered = filtered.filter(venue =>
        venue.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredVenues(filtered)
  }, [venues, searchTerm])

  useEffect(() => {
    filterVenues()
  }, [filterVenues])

  const loadVenues = async () => {
    try {
      setLoading(true)
      const response = await venuesAPI.getVenues()
      setVenues(response.data)
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando recintos...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRoles={['organizer']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Recintos</h1>
            <p className="text-gray-600">Administra tus recintos y ubicaciones</p>
          </div>
          <Link href="/organizer/venues/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Recinto
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Recintos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, dirección o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-2 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      {venue.nombre}
                    </CardTitle>
                    <Badge variant="outline">
                      {venue.zones?.length || 0} zona(s)
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {venue.direccion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Venue Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{venue.ciudad}, {venue.pais}</span>
                      </div>
                      
                      {(venue.latitud && venue.longitud) && (
                        <div className="text-xs text-gray-500">
                          Coordenadas: {venue.latitud.toFixed(4)}, {venue.longitud.toFixed(4)}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Link href={`/organizer/venues/${venue.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/organizer/venues/${venue.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recintos</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'No hay recintos que coincidan con tu búsqueda.'
                    : 'Aún no has creado ningún recinto.'
                  }
                </p>
                {!searchTerm && (
                  <Link href="/organizer/venues/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear tu primer recinto
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {filteredVenues.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-gray-600">
                Mostrando {filteredVenues.length} de {venues.length} recinto(s)
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
