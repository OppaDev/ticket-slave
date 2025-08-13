'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, ArrowLeft, Calendar, Hash, Type } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { categoriesAPI } from '@/lib/api'
import type { Category } from '@/types'

export default function CategoryDetail() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCategory = async (categoryId: string) => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getCategory(categoryId)
      setCategory(response.data)
    } catch (error) {
      console.error('Error loading category:', error)
      router.push('/organizer/categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadCategory(params.id as string)
    }
  }, [params.id])

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

  if (!category) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Categoría no encontrada</h3>
              <p className="text-gray-600 mb-6">
                La categoría que buscas no existe o ha sido eliminada.
              </p>
              <Link href="/organizer/categories">
                <Button>Volver a categorías</Button>
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
          <Link href="/organizer/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{category.nombre}</h1>
            <p className="text-gray-600">Detalles de la categoría</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/categories/${category.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar categoría
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Información básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">ID</label>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4 text-gray-400" />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.id}</code>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-lg font-medium">{category.nombre}</p>
            </div>
            
            {category.descripcion && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{category.descripcion}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información de estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Estado y fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <div className="mt-1">
                <Badge variant={category.activo ? "default" : "secondary"}>
                  {category.activo ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </div>
            
            {category.fechaCreacion && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de creación</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(category.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </>
            )}
            
            {category.fechaActualizacion && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-700">Última actualización</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(category.fechaActualizacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
