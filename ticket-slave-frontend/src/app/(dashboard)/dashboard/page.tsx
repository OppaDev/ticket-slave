'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { dashboardAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Calendar,
  TrendingUp,
  Activity,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react'
import type { AdminDashboardStats, RecentActivity } from '@/types'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch dashboard statistics
  const fetchStats = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)
      else setLoading(true)

      // Obtener estadísticas y actividad reciente en paralelo
      const [statsResponse, activityResponse] = await Promise.all([
        dashboardAPI.getAdminStats(),
        dashboardAPI.getRecentActivity()
      ])
      
      setStats(statsResponse.data)
      setRecentActivity(activityResponse.data)
      
      if (showRefreshToast) {
        toast.success('Estadísticas actualizadas')
      }
    } catch (error) {
    //   console.error('Error fetching admin stats:', error)
      toast.error('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Debug: imprimir stats cuando cambien
  useEffect(() => {
    if (stats) {
      console.log('Dashboard stats loaded:', JSON.stringify(stats, null, 2))
    }
  }, [stats])

  const handleRefresh = () => {
    fetchStats(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      description: 'Usuarios registrados en el sistema',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Usuarios Activos',
      value: stats?.activeUsers || 0,
      description: 'Usuarios con estado activo',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Usuarios Inactivos',
      value: stats?.inactiveUsers || 0,
      description: 'Usuarios desactivados',
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Registros Recientes',
      value: stats?.recentRegistrations || 0,
      description: 'Nuevos usuarios este mes',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const roleCards = [
    {
      role: 'admin',
      label: 'Administradores',
      count: stats?.usersByRole?.admin || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badgeVariant: 'destructive' as const,
    },
    {
      role: 'organizer',
      label: 'Organizadores', 
      count: stats?.usersByRole?.organizer || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badgeVariant: 'default' as const,
    },
    {
      role: 'customer',
      label: 'Clientes',
      count: stats?.usersByRole?.customer || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badgeVariant: 'secondary' as const,
    },
  ]

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-1">
              Gestiona usuarios, roles y monitorea la actividad del sistema
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Usuarios por Rol
            </CardTitle>
            <CardDescription>
              Distribución de usuarios según sus roles en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleCards.map((role) => (
                <div 
                  key={role.role}
                  className={`p-4 rounded-lg border ${role.bgColor} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={role.badgeVariant} className="capitalize">
                      {role.role}
                    </Badge>
                    <span className={`text-2xl font-bold ${role.color}`}>
                      {role.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{role.label}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-current ${role.color}`}
                      style={{ 
                        width: `${stats?.totalUsers ? (role.count / stats.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.totalUsers ? 
                      `${((role.count / stats.totalUsers) * 100).toFixed(1)}% del total` 
                      : '0% del total'
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Herramientas de administración más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/dashboard/users'}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Gestionar Usuarios</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/dashboard/roles'}
              >
                <Crown className="h-6 w-6" />
                <span className="text-sm">Roles y Permisos</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/dashboard/audit'}
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Logs de Auditoría</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/dashboard/reports'}
              >
                <PieChart className="h-6 w-6" />
                <span className="text-sm">Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay actividad reciente disponible</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Toda la Actividad
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
