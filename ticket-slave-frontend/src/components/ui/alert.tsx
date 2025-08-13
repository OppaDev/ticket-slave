import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlertProps {
  title?: string
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  onClose?: () => void
  className?: string
}

export function Alert({ title, message, type = 'error', onClose, className = '' }: AlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      case 'success':
        return 'text-green-500'
      default:
        return 'text-red-500'
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${getIconColor()}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className={`h-4 w-4 ${getIconColor()}`} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
