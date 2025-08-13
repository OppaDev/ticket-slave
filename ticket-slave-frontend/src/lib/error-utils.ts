// Utilidad para parsear errores de la API
export interface ParsedError {
  title: string
  message: string
  fieldErrors?: Record<string, string>
}

export function parseApiError(error: unknown): ParsedError {
  console.error('API Error:', error)

  // Verificar si es un error de axios
  const axiosError = error as { response?: { status: number; data?: { message?: string } } }

  // Error de red o sin respuesta
  if (!axiosError.response) {
    return {
      title: 'Error de Conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    }
  }

  const { status, data } = axiosError.response

  // Error 400 - Bad Request con detalles específicos
  if (status === 400 && data?.message) {
    const message = data.message

    // Intentar extraer errores de validación específicos
    const fieldErrors: Record<string, string> = {}
    let generalMessage = 'Por favor, corrige los errores en el formulario:'

    // Parsear mensajes de validación de Joi
    if (typeof message === 'string') {
      // Dividir por punto para obtener múltiples errores
      const errors = message.split('. ')
      
      errors.forEach(error => {
        // Buscar patrones como "campo" is required, "campo" length must be...
        const fieldMatch = error.match(/"([^"]+)"/)
        if (fieldMatch) {
          const fieldName = fieldMatch[1]
          let friendlyMessage = error

          // Convertir mensajes técnicos a mensajes amigables
          if (error.includes('is required') || error.includes('is not allowed to be empty')) {
            friendlyMessage = 'Este campo es requerido'
          } else if (error.includes('length must be at least')) {
            const lengthMatch = error.match(/at least (\d+) characters/)
            const minLength = lengthMatch ? lengthMatch[1] : '20'
            friendlyMessage = `Debe tener al menos ${minLength} caracteres`
          } else if (error.includes('must be a valid')) {
            friendlyMessage = 'Formato inválido'
          } else if (error.includes('must be')) {
            friendlyMessage = 'Valor inválido'
          }

          fieldErrors[fieldName] = friendlyMessage
        }
      })
    }

    // Si hay errores específicos de campos, incluirlos en el mensaje
    if (Object.keys(fieldErrors).length > 0) {
      const errorList = Object.entries(fieldErrors)
        .map(([field, msg]) => `• ${field}: ${msg}`)
        .join('\n')
      generalMessage += '\n\n' + errorList
    }

    return {
      title: 'Errores de Validación',
      message: generalMessage,
      fieldErrors
    }
  }

  // Error 401 - No autorizado
  if (status === 401) {
    return {
      title: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    }
  }

  // Error 403 - Prohibido
  if (status === 403) {
    return {
      title: 'Acceso Denegado',
      message: 'No tienes permisos para realizar esta acción.'
    }
  }

  // Error 404 - No encontrado
  if (status === 404) {
    return {
      title: 'Recurso No Encontrado',
      message: 'El recurso solicitado no existe o ha sido eliminado.'
    }
  }

  // Error 409 - Conflicto (ej: duplicados)
  if (status === 409) {
    return {
      title: 'Conflicto',
      message: data?.message || 'Ya existe un recurso con estos datos.'
    }
  }

  // Error 500 - Error del servidor
  if (status >= 500) {
    return {
      title: 'Error del Servidor',
      message: 'Ocurrió un error en el servidor. Por favor, inténtalo más tarde.'
    }
  }

  // Error genérico
  return {
    title: 'Error',
    message: data?.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
  }
}
