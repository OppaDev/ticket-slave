'use client'

import { useAuth } from './use-auth'
import type { Permission } from '@/types'

export function usePermissions() {
  const { user, isAdmin, isOrganizer, isCustomer } = useAuth()

  // Check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!user?.role?.permissions) return false
    
    // Admin has all permissions
    if (isAdmin) return true
    
    return user.role.permissions.some(
      (permission: Permission) => permission.nombre === permissionName
    )
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission))
  }

  // Check if user can perform action on resource
  const canPerform = (action: string, resource: string, scope: 'own' | 'any' = 'any'): boolean => {
    if (!user) return false
    
    // Admin can do everything
    if (isAdmin) return true

    // Build permission name
    const permissionName = `${resource}:${action}${scope === 'own' ? ':own' : ''}`
    
    return hasPermission(permissionName)
  }

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

  // Get user's permissions list
  const getUserPermissions = (): Permission[] => {
    return user?.role?.permissions || []
  }

  // Get user's role name
  const getUserRole = (): string | undefined => {
    return user?.role?.nombre
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerform,
    permissions,
    getUserPermissions,
    getUserRole,
    user,
    isAdmin,
    isOrganizer,
    isCustomer,
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
