'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { eventsAPI, categoriesAPI } from '@/lib/api'
import { useTicketsWebSocket } from '@/hooks/use-websocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Calendar, MapPin, Users, Filter, Loader2 } from 'lucide-react'
import type { Event, Category } from '@/types'

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const { joinEvent, leaveEvent, onStockUpdate } = useTicketsWebSocket()

  // Fetch events and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [eventsResponse, categoriesResponse] = await Promise.all([
          eventsAPI.getEvents(),
          categoriesAPI.getCategories()
        ])
        
        // Solo mostrar eventos publicados en la vista pública
        const publishedEvents = (eventsResponse.data.data || eventsResponse.data)
          .filter((event: Event) => event.status === 'PUBLICADO')
        
        setAllEvents(publishedEvents)
        setCategories(categoriesResponse.data.data || categoriesResponse.data)
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        toast.error('Error al cargar los eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter events based on search and category
  useEffect(() => {
    let filtered = allEvents

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.categoryId === selectedCategory)
    }

    setFilteredEvents(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [allEvents, searchQuery, selectedCategory])

  // Setup WebSocket for real-time stock updates
  useEffect(() => {
    const cleanup = onStockUpdate((data) => {
      toast.info(`Stock actualizado para el evento: ${data.available} tickets disponibles`)
    })

    return cleanup
  }, [onStockUpdate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // El filtrado se maneja automáticamente por el useEffect
  }

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => ({ ...prev, [eventId]: true }))
  }

  // Pagination logic
  const itemsPerPage = 9
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: Event) => {
    const now = new Date()
    const startDate = new Date(event.fechaInicio)
    const endDate = new Date(event.fechaFin)
    
    if (now > endDate) {
      return { label: 'Finalizado', variant: 'secondary' as const }
    }
    
    if (now >= startDate && now <= endDate) {
      return { label: 'En Curso', variant: 'default' as const }
    }
    
    return { label: 'Próximamente', variant: 'outline' as const }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando eventos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600 mt-1">
                Descubre los mejores eventos cerca de ti
                {!loading && filteredEvents.length > 0 && (
                  <span className="ml-2 text-sm font-medium text-blue-600">
                    ({filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} disponible{filteredEvents.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar eventos por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button type="submit" className="w-full md:w-auto">
              Buscar
            </Button>
          </form>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => {
            const status = getEventStatus(event)
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow overflow-hidden">
                {/* Event Image */}
                {event.imagenUrl && !imageErrors[event.id] && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.imagenUrl}
                      alt={event.nombre}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(event.id)}
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.nombre}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.category?.nombre}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.fechaInicio)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {event.venue?.nombre || 'Ubicación no especificada'}
                    </span>
                  </div>
                  
                  {event.venue?.ciudad && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.venue.ciudad}, {event.venue.pais}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {event.descripcion}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Ver detalles
                  </div>
                  
                  <Link href={`/events/${event.id}`}>
                    <Button 
                      size="sm"
                      onMouseEnter={() => joinEvent(event.id)}
                      onMouseLeave={() => leaveEvent(event.id)}
                    >
                      Comprar Tickets
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Intenta con otros criterios de búsqueda' 
                  : 'No hay eventos publicados en este momento'
                }
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredEvents.length > itemsPerPage && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
            
            <div className="ml-4 flex items-center text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} de {filteredEvents.length} eventos
            </div>
          </div>
        )}
      </div>
    </div>
  )
}