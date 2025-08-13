'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { usersAPI, rbacAPI } from '@/lib/api'
import type { Permission, Role } from '@/types'

export function usePermissions() {
  const { user, isAdmin, isOrganizer, isCustomer } = useAuth()
  const [userPermissions, setUserPermissions] = useState<Permission[]>([])
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  // Fetch user's detailed role and permissions from backend
  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // 1. Get detailed user info with role (según HAR: GET /users/:id incluye rol)
      const userResponse = await usersAPI.getUser(user.id)
      const detailedUser = userResponse.data
      
      if (detailedUser.role) {
        setUserRole(detailedUser.role)
        
        // 2. Get detailed role with permissions (según HAR: GET /roles/:id incluye permisos)
        const roleResponse = await rbacAPI.getRole(detailedUser.role.id)
        const detailedRole = roleResponse.data
        
        if (detailedRole.permissions) {
          setUserPermissions(detailedRole.permissions)
        }
      }
      
      setPermissionsLoaded(true)
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      // Fallback: usar información básica del usuario si existe
      if (user?.role) {
        setUserRole(user.role)
        setUserPermissions(user.role.permissions || [])
      }
      setPermissionsLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.role])

  // Fetch permissions when user changes
  useEffect(() => {
    if (user) {
      fetchUserPermissions()
    } else {
      setUserPermissions([])
      setUserRole(null)
      setPermissionsLoaded(false)
      setLoading(false)
    }
  }, [user, fetchUserPermissions])

  // Check if user has a specific permission
  const hasPermission = useCallback((permissionName: string): boolean => {
    if (!permissionsLoaded) return false // No permitir hasta que se carguen
    
    // Admin has all permissions
    if (isAdmin) return true
    
    return userPermissions.some(
      (permission: Permission) => permission.nombre === permissionName
    )
  }, [userPermissions, isAdmin, permissionsLoaded])

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission))
  }, [hasPermission])

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission))
  }, [hasPermission])

  // Check if user can perform action on resource
  const canPerform = useCallback((action: string, resource: string, scope: 'own' | 'any' = 'any'): boolean => {
    if (!user || !permissionsLoaded) return false
    
    // Admin can do everything
    if (isAdmin) return true

    // Build permission name
    const permissionName = `${resource}:${action}${scope === 'own' ? ':own' : ''}`
    
    return hasPermission(permissionName)
  }, [user, isAdmin, hasPermission, permissionsLoaded])

  // Specific permission checks for common operations
  const permissions = {
    // Users management
    canReadUsers: () => hasPermission('users:read') || isAdmin,
    canCreateUsers: () => hasPermission('users:create') || isAdmin,
    canUpdateUsers: () => hasPermission('users:update:any') || isAdmin,
    canUpdateOwnProfile: () => hasPermission('users:update:own') || Boolean(user),
    canDeleteUsers: () => hasPermission('users:delete') || isAdmin,
    canAssignRoles: () => hasPermission('users:assign-role') || isAdmin,
    
    // RBAC management
    canManageRBAC: () => hasPermission('rbac:manage') || isAdmin,
    canCreateRoles: () => hasPermission('roles:create') || isAdmin,
    canUpdateRoles: () => hasPermission('roles:update') || isAdmin,
    canDeleteRoles: () => hasPermission('roles:delete') || isAdmin,
    canManagePermissions: () => hasPermission('permissions:manage') || isAdmin,
    
    // Events management
    canCreateEvents: () => hasPermission('events:create') || isOrganizer || isAdmin,
    canReadOwnEvents: () => hasPermission('events:read:own') || isOrganizer || isAdmin,
    canUpdateOwnEvents: () => hasPermission('events:update:own') || isOrganizer || isAdmin,
    canDeleteOwnEvents: () => hasPermission('events:delete:own') || isOrganizer || isAdmin,
    canPublishOwnEvents: () => hasPermission('events:publish:own') || isOrganizer || isAdmin,
    
    // Tickets management
    canManageOwnCart: () => hasPermission('cart:manage:own') || isCustomer || isAdmin,
    canCreateOwnOrders: () => hasPermission('orders:create:own') || isCustomer || isAdmin,
    canReadOwnOrders: () => hasPermission('orders:read:own') || isCustomer || isAdmin,
    canReadOwnTickets: () => hasPermission('tickets:read:own') || isCustomer || isAdmin,
    canValidateTickets: () => hasPermission('tickets:validate') || isOrganizer || isAdmin,
    
    // Dashboard access
    canAccessAdminDashboard: () => isAdmin,
    canAccessOrganizerDashboard: () => isOrganizer || isAdmin,
    canAccessCustomerDashboard: () => isCustomer || isOrganizer || isAdmin,
    
    // Reports and analytics
    canViewReports: () => hasPermission('reports:read') || isAdmin,
    canExportData: () => hasPermission('data:export') || isAdmin,
    canViewAuditLogs: () => hasPermission('audit:read') || isAdmin,
  }

  // Get user's permissions list (from backend)
  const getUserPermissions = (): Permission[] => {
    return userPermissions
  }

  // Get user's role name (from backend)
  const getUserRole = (): string | undefined => {
    return userRole?.nombre
  }

  // Refresh permissions from backend
  const refreshPermissions = () => {
    fetchUserPermissions()
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerform,
    permissions,
    getUserPermissions,
    getUserRole,
    refreshPermissions,
    user,
    isAdmin,
    isOrganizer,
    isCustomer,
    loading,
    permissionsLoaded,
  }
}

// Hook for components that require specific permissions
export function useRequirePermissions(requiredPermissions: string[]) {
  const { hasAllPermissions, user } = usePermissions()
  
  const hasAccess = hasAllPermissions(requiredPermissions)
  
  return {
    hasAccess,
    user,
    loading: !user, // Simple loading state
  }
}

// Hook for role-based access
export function useRequireRole(allowedRoles: string[]) {
  const { getUserRole, user } = usePermissions()
  
  const userRole = getUserRole()
  const hasAccess = userRole ? allowedRoles.includes(userRole) : false
  
  return {
    hasAccess,
    user,
    userRole,
    loading: !user,
  }
}
