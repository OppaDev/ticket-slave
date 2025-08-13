'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, MapPin, Building, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { venuesAPI, zonesAPI } from '@/lib/api'
import type { Venue, Zone } from '@/types'

interface VenueFormData {
  nombre: string
  direccion: string
  ciudad: string
  pais: string
  latitud?: number
  longitud?: number
}

interface ZoneFormData {
  id?: string
  nombre: string
  capacidad: string | number
}

export default function EditVenue() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [formData, setFormData] = useState<VenueFormData>({
    nombre: '',
    direccion: '',
    ciudad: '',
    pais: ''
  })
  const [zones, setZones] = useState<ZoneFormData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadVenue = useCallback(async (venueId: string) => {
    try {
      setLoading(true)
      const response = await venuesAPI.getVenue(venueId)
      const venueData = response.data
      setVenue(venueData)
      setFormData({
        nombre: venueData.nombre,
        direccion: venueData.direccion,
        ciudad: venueData.ciudad,
        pais: venueData.pais,
        latitud: venueData.latitud || undefined,
        longitud: venueData.longitud || undefined
      })
      setZones(venueData.zones?.map((zone: Zone) => ({
        id: zone.id,
        nombre: zone.nombre,
        capacidad: zone.capacidad
      })) || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!venue) return

    try {
      setSaving(true)
      
      // Primero actualizar la información básica del venue
      await venuesAPI.updateVenue(venue.id, formData)
      
      // Luego manejar las zonas individualmente
      await updateZones()
      
      router.push(`/organizer/venues/${venue.id}`)
    } catch (error) {
      console.error('Error updating venue:', error)
      alert('Error al actualizar el recinto')
    } finally {
      setSaving(false)
    }
  }

  const updateZones = async () => {
    if (!venue) return

    // Obtener zonas actuales del servidor
    const currentZonesResponse = await zonesAPI.getVenueZones(venue.id)
    const currentZones = currentZonesResponse.data

    // Zonas a mantener/actualizar (las que tienen ID)
    const zonesToUpdate = zones.filter(zone => zone.id)
    // Zonas nuevas (las que no tienen ID)
    const zonesToCreate = zones.filter(zone => !zone.id)
    // Zonas a eliminar (las que están en el servidor pero no en el formulario)
    const zonesToDelete = currentZones.filter(
      (currentZone: Zone) => !zones.find(zone => zone.id === currentZone.id)
    )

    // Actualizar zonas existentes
    for (const zone of zonesToUpdate) {
      if (zone.id) {
        await zonesAPI.updateVenueZone(venue.id, zone.id, {
          nombre: zone.nombre,
          capacidad: typeof zone.capacidad === 'string' ? parseInt(zone.capacidad) : zone.capacidad
        })
      }
    }

    // Crear zonas nuevas
    for (const zone of zonesToCreate) {
      await zonesAPI.createVenueZone(venue.id, {
        nombre: zone.nombre,
        capacidad: typeof zone.capacidad === 'string' ? parseInt(zone.capacidad) : zone.capacidad
      })
    }

    // Eliminar zonas que ya no están
    for (const zone of zonesToDelete) {
      await zonesAPI.deleteVenueZone(venue.id, zone.id)
    }
  }

  const handleInputChange = (field: keyof VenueFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      [field]: field === 'latitud' || field === 'longitud' 
        ? (value === '' ? undefined : parseFloat(value))
        : value
    }))
  }

  const handleZoneChange = (index: number, field: keyof ZoneFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newZones = [...zones]
    newZones[index] = {
      ...newZones[index],
      [field]: e.target.value
    }
    setZones(newZones)
  }

  const addZone = () => {
    setZones([...zones, { nombre: '', capacidad: '' }])
  }

  const removeZone = (index: number) => {
    const zoneToRemove = zones[index]
    
    // Confirmar eliminación si la zona existe en el servidor
    if (zoneToRemove.id) {
      if (!confirm(`¿Estás seguro de que quieres eliminar la zona "${zoneToRemove.nombre}"? Esta acción no se puede deshacer.`)) {
        return
      }
    }
    
    // Remover la zona de la UI
    const newZones = zones.filter((_, i) => i !== index)
    setZones(newZones)
  }

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
          <Link href={`/organizer/venues/${venue.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar recinto</h1>
            <p className="text-gray-600">{venue.nombre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/venues/${venue.id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Ver recinto
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="nombre">Nombre del recinto *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={handleInputChange('nombre')}
                placeholder="Nombre del recinto"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={handleInputChange('direccion')}
                placeholder="Dirección completa"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange('ciudad')}
                  placeholder="Ciudad"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pais">País *</Label>
                <Input
                  id="pais"
                  value={formData.pais}
                  onChange={handleInputChange('pais')}
                  placeholder="País"
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coordenadas GPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Coordenadas GPS (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitud">Latitud</Label>
                <Input
                  id="latitud"
                  type="number"
                  step="any"
                  value={formData.latitud || ''}
                  onChange={handleInputChange('latitud')}
                  placeholder="Ej: -34.6037"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="longitud">Longitud</Label>
                <Input
                  id="longitud"
                  type="number"
                  step="any"
                  value={formData.longitud || ''}
                  onChange={handleInputChange('longitud')}
                  placeholder="Ej: -58.3816"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zonas */}
        <Card>
          <CardHeader>
            <CardTitle>Zonas del recinto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {zones.map((zone, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Zona {index + 1}</h4>
                  {zones.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeZone(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`zone-${index}-nombre`}>Nombre de la zona *</Label>
                    <Input
                      id={`zone-${index}-nombre`}
                      value={zone.nombre}
                      onChange={handleZoneChange(index, 'nombre')}
                      placeholder="Ej: Platea, Palco, General"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`zone-${index}-capacidad`}>Capacidad *</Label>
                    <Input
                      id={`zone-${index}-capacidad`}
                      type="number"
                      value={zone.capacidad}
                      onChange={handleZoneChange(index, 'capacidad')}
                      placeholder="Número de personas"
                      required
                      min="1"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addZone}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar zona
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/organizer/venues/${venue.id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
