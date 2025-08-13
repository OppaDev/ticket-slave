'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { categoriesAPI } from '@/lib/api'
import type { Category } from '@/types'

interface CategoryFormData {
  nombre: string
  descripcion?: string
}

export default function EditCategory() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: '',
    descripcion: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getCategory(categoryId)
      const categoryData = response.data
      setCategory(categoryData)
      setFormData({
        nombre: categoryData.nombre,
        descripcion: categoryData.descripcion || ''
      })
    } catch (error) {
      console.error('Error loading category:', error)
      router.push('/organizer/categories')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (params.id) {
      loadCategory(params.id as string)
    }
  }, [params.id, loadCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category) return

    try {
      setSaving(true)
      await categoriesAPI.updateCategory(category.id, formData)
      router.push(`/organizer/categories/${category.id}`)
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error al actualizar la categoría')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CategoryFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
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
          <Link href={`/organizer/categories/${category.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar categoría</h1>
            <p className="text-gray-600">{category.nombre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/organizer/categories/${category.id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Ver categoría
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={handleInputChange('nombre')}
                placeholder="Nombre de la categoría"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange('descripcion')}
                placeholder="Descripción de la categoría (opcional)"
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/organizer/categories/${category.id}`}>
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
