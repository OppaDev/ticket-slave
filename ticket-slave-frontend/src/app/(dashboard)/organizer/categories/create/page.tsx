'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag, Save, Folder } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { categoriesAPI } from '@/lib/api'
import { parseApiError, type ParsedError } from '@/lib/error-utils'
import type { CreateCategoryRequest } from '@/types'

export default function CreateCategory() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    nombre: '',
    descripcion: '',
  })

  const [errors, setErrors] = useState<Partial<CreateCategoryRequest>>({})
  const [apiError, setApiError] = useState<ParsedError | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCategoryRequest> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
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
      
      // Enviar solo campos no vacíos
      const categoryData: CreateCategoryRequest = {
        nombre: formData.nombre.trim(),
      }
      
      if (formData.descripcion?.trim()) {
        categoryData.descripcion = formData.descripcion.trim()
      }
      
      const response = await categoriesAPI.createCategory(categoryData)
      
      // Redirigir a la categoría creada
      router.push(`/organizer/categories/${response.data.id}`)
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

  const handleInputChange = (field: keyof CreateCategoryRequest, value: string) => {
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
          <Link href="/organizer/categories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Categoría</h1>
            <p className="text-gray-600">Organiza tus eventos con categorías</p>
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
                  <Folder className="w-5 h-5 mr-2" />
                  Información de la Categoría
                </CardTitle>
                <CardDescription>
                  Datos de la nueva categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Categoría *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Música, Deportes, Teatro"
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describe qué tipo de eventos incluye esta categoría..."
                    rows={4}
                    className={errors.descripcion ? 'border-red-500' : ''}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-600">{errors.descripcion}</p>
                  )}
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
                      Crear Categoría
                    </>
                  )}
                </Button>
                
                <Link href="/organizer/categories" className="block">
                  <Button variant="outline" className="w-full" type="button">
                    Cancelar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">
                      {formData.nombre || 'Nombre de la categoría'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
