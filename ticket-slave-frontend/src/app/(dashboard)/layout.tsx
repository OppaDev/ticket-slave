'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Users, 
  Crown, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Home,
  Calendar,
  Ticket,
  Bell,
  Shield,
  MapPin,
  Tag,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface NavItem {
  name: string
  href: string
  icon: typeof Users
  requiredRoles?: string[]
  requiredPermissions?: string[]
}

const navigation: NavItem[] = [
  // Admin Dashboard
  {
    name: 'Admin Dashboard',
    href: '/dashboard',
    icon: Home,
    requiredRoles: ['admin'],
  },
  // Organizer Dashboard
  {
    name: 'Organizador',
    href: '/organizer',
    icon: Building,
    requiredRoles: ['organizer'],
  },
  
  // Admin-only sections
  {
    name: 'Usuarios',
    href: '/dashboard/users',
    icon: Users,
    requiredPermissions: ['users:read'],
  },
  {
    name: 'Roles',
    href: '/dashboard/roles',
    icon: Crown,
    requiredPermissions: ['rbac:manage'],
  },
  {
    name: 'Permisos',
    href: '/dashboard/permissions',
    icon: Shield,
    requiredPermissions: ['rbac:manage'],
  },
  
  // Organizer sections
  {
    name: 'Mis Eventos',
    href: '/organizer/events',
    icon: Calendar,
    requiredRoles: ['organizer'],
  },
  {
    name: 'Mis Recintos',
    href: '/organizer/venues',
    icon: MapPin,
    requiredRoles: ['organizer'],
  },
  {
    name: 'Categorías',
    href: '/organizer/categories',
    icon: Tag,
    requiredRoles: ['organizer'],
  },
  
  // Shared sections
  {
    name: 'Todos los Eventos',
    href: '/dashboard/events',
    icon: Calendar,
    requiredRoles: ['admin'],
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    icon: Ticket,
    requiredRoles: ['admin', 'organizer'],
  },
  {
    name: 'Reportes',
    href: '/dashboard/reports',
    icon: BarChart3,
    requiredRoles: ['admin'],
  },
  {
    name: 'Auditoría',
    href: '/dashboard/audit',
    icon: Bell,
    requiredPermissions: ['audit:read'],
  },
  {
    name: 'Notificaciones',
    href: '/dashboard/notifications',
    icon: Bell,
    requiredRoles: ['admin'],
  },
]

function Sidebar({ className = '' }: { className?: string }) {
  const { user, logout } = useAuth()
  const { hasAnyPermission, getUserRole, permissionsLoaded } = usePermissions()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada exitosamente')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // Filter navigation based on permissions (only when permissions are loaded)
  const filteredNavigation = permissionsLoaded ? navigation.filter(item => {
    // Check role access
    if (item.requiredRoles) {
      const userRole = getUserRole()
      if (!userRole || !item.requiredRoles.includes(userRole)) {
        return false
      }
    }

    // Check permission access
    if (item.requiredPermissions) {
      if (!hasAnyPermission(item.requiredPermissions)) {
        return false
      }
    }

    return true
  }) : []

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Logo and User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Ticket Slave</h2>
            <p className="text-sm text-gray-500">
              {user?.role?.nombre === 'admin' ? 'Admin Panel' : 
               user?.role?.nombre === 'organizer' ? 'Organizador' : 
               'Panel de Usuario'}
            </p>
          </div>
        </div>
        
        {user && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Badge 
              variant={user.role?.nombre === 'admin' ? 'destructive' : 'default'}
              className="text-xs"
            >
              {user.role?.nombre}
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const showSeparator = 
            (item.href === '/dashboard/users' && filteredNavigation.some(nav => nav.href === '/dashboard')) ||
            (item.href === '/organizer/events' && filteredNavigation.some(nav => nav.href === '/organizer')) ||
            (item.href === '/dashboard/events' && filteredNavigation.some(nav => nav.href === '/organizer/categories')) ||
            (item.href === '/dashboard/tickets')
          
          return (
            <div key={item.name}>
              {showSeparator && (
                <div className="border-t border-gray-200 my-3 pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    {item.href.startsWith('/dashboard/users') ? 'Administración' :
                     item.href.startsWith('/organizer/events') ? 'Gestión de Eventos' :
                     item.href.startsWith('/dashboard/events') ? 'Sistema' :
                     item.href.startsWith('/dashboard/tickets') ? 'Operaciones' : ''}
                  </p>
                </div>
              )}
              <Link 
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Configuraciones
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { loading: authLoading } = useAuth()
  const { loading: permissionsLoading, permissionsLoaded } = usePermissions()

  // Show loading screen while auth or permissions are loading
  if (authLoading || permissionsLoading || !permissionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white shadow-sm">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden fixed top-4 left-4 z-50"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}