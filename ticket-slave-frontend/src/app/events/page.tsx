'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { useTicketsWebSocket } from '@/hooks/use-websocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Calendar, MapPin, Users, Filter, Loader2 } from 'lucide-react'
import type { Event, Category } from '@/types'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const { joinEvent, leaveEvent, onStockUpdate } = useTicketsWebSocket()

  // Fetch events and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [eventsResponse, categoriesResponse] = await Promise.all([
          eventsAPI.getEvents({ 
            search: searchQuery || undefined, 
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            page: currentPage 
          }),
          eventsAPI.getCategories()
        ])
        
        setEvents(eventsResponse.data.data || eventsResponse.data)
        setCategories(categoriesResponse.data.data || categoriesResponse.data)
      } catch (error: unknown) {
        console.error('Error fetching data:', error)
        toast.error('Error al cargar los eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, selectedCategory, currentPage])

  // Setup WebSocket for real-time stock updates
  useEffect(() => {
    const cleanup = onStockUpdate((data) => {
      toast.info(`Stock actualizado para el evento: ${data.available} tickets disponibles`)
    })

    return cleanup
  }, [onStockUpdate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

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

    if (event.status === 'BORRADOR') {
      return { label: 'Borrador', variant: 'secondary' as const }
    }
    
    if (now > endDate) {
      return { label: 'Finalizado', variant: 'outline' as const }
    }
    
    if (now >= startDate && now <= endDate) {
      return { label: 'En Curso', variant: 'default' as const }
    }
    
    return { label: 'Próximamente', variant: 'default' as const }
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
              <p className="text-gray-600 mt-1">Descubre los mejores eventos cerca de ti</p>
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
          {events.map((event) => {
            const status = getEventStatus(event)
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
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
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.fechaInicio)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue?.nombre || 'Venue no especificado'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Organizado por {event.organizer?.nombre || 'Organizador'}
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {event.descripcion}
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {event.ticketTypes?.length || 0} tipos de ticket
                  </div>
                  
                  <Link href={`/events/${event.id}`}>
                    <Button 
                      size="sm"
                      disabled={event.status === 'BORRADOR'}
                      onMouseEnter={() => joinEvent(event.id)}
                      onMouseLeave={() => leaveEvent(event.id)}
                    >
                      {event.status === 'BORRADOR' ? 'No Disponible' : 'Ver Detalles'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {events.length === 0 && !loading && (
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
            </div>
          </div>
        )}

        {/* Pagination */}
        {events.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                Página {currentPage}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={events.length < 10} // Assuming 10 items per page
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}