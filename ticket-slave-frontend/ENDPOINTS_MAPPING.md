# Mapeo de Endpoints - Frontend vs HAR

Este documento muestra la correspondencia entre los endpoints definidos en el frontend y los endpoints reales del microservicio según el archivo HAR proporcionado.

## Endpoints del Microservicio (basados en HAR)

### Autenticación
- ✅ `POST /api/v1/auth/login` - Login de usuario
- ❌ `POST /api/v1/auth/register` - Registro (404 en HAR, endpoint no disponible)
- ✅ `POST /api/v1/auth/recover` - Solicitar recuperación de contraseña
- ✅ `POST /api/v1/auth/reset` - Resetear contraseña con token

### Gestión de Usuarios
- ✅ `GET /api/v1/users` - Obtener lista de usuarios
- ✅ `GET /users/{id}` - Obtener usuario por ID
- ✅ `PATCH /api/v1/users/{id}` - Actualizar usuario
- ✅ `DELETE /users/{id}` - Eliminar usuario
- ✅ `POST /api/v1/users/{id}/role` - Asignar rol a usuario
- ✅ `GET /users/{id}/role` - Obtener rol de usuario

### Gestión de Roles
- ✅ `GET /api/v1/roles` - Obtener lista de roles
- ✅ `GET /api/v1/roles/{id}` - Obtener rol por ID
- ✅ `POST /api/v1/roles` - Crear nuevo rol
- ✅ `PATCH /api/v1/roles/{id}` - Actualizar rol
- ✅ `DELETE /api/v1/roles/{id}` - Eliminar rol

### Gestión de Permisos
- ✅ `GET /api/v1/permissions` - Obtener lista de permisos
- ✅ `GET /api/v1/permissions/{id}` - Obtener permiso por ID
- ✅ `POST /api/v1/permissions` - Crear nuevo permiso
- ✅ `PATCH /api/v1/permissions/{id}` - Actualizar permiso
- ✅ `DELETE /api/v1/permissions/{id}` - Eliminar permiso

### Rol-Permisos
- ✅ `GET /api/v1/roles/{id}/permissions` - Obtener permisos de un rol
- ✅ `POST /api/v1/roles/{id}/permissions` - Asignar permisos a rol

## Endpoints Frontend Actualizados

### authAPI
```typescript
login: (email, password) => POST /api/v1/auth/login
register: (userData) => POST /api/v1/auth/register // ⚠️ Endpoint no disponible
recoverPassword: (email) => POST /api/v1/auth/recover
resetPassword: (data) => POST /api/v1/auth/reset
```

### usersAPI
```typescript
getUsers: () => GET /api/v1/users
getUser: (id) => GET /users/${id}
updateUser: (id, userData) => PATCH /api/v1/users/${id}
deleteUser: (id) => DELETE /users/${id}
assignRole: (userId, roleId) => POST /api/v1/users/${userId}/role
getUserRole: (userId) => GET /users/${userId}/role
```

### rbacAPI
```typescript
getRoles: () => GET /api/v1/roles
getRole: (id) => GET /api/v1/roles/${id}
createRole: (roleData) => POST /api/v1/roles
updateRole: (id, roleData) => PATCH /api/v1/roles/${id}
deleteRole: (id) => DELETE /api/v1/roles/${id}

getPermissions: () => GET /api/v1/permissions
getPermission: (id) => GET /api/v1/permissions/${id}
createPermission: (permissionData) => POST /api/v1/permissions
updatePermission: (id, permissionData) => PATCH /api/v1/permissions/${id}
deletePermission: (id) => DELETE /api/v1/permissions/${id}

getRolePermissions: (roleId) => GET /api/v1/roles/${roleId}/permissions
assignPermissionsToRole: (roleId, permissions) => POST /api/v1/roles/${roleId}/permissions
```

## Notas Importantes

1. **Inconsistencias en rutas**: Algunos endpoints usan `/api/v1/` y otros no. El HAR muestra:
   - Usuarios: `/api/v1/users` para GET y PATCH, pero `/users/{id}` para GET single y DELETE
   - Roles y Permisos: Consistentemente usan `/api/v1/`

2. **Endpoint de registro no disponible**: El HAR muestra un 404 para el endpoint de registro, probablemente no está implementado aún.

3. **Estructura de datos**: Los endpoints esperan y devuelven datos en formato JSON con estructuras específicas según las respuestas del HAR.

4. **Autenticación**: Todos los endpoints protegidos requieren el header `Authorization: Bearer {token}`.

## Datos de Ejemplo del HAR

### Usuario típico:
```json
{
  "id": "1097717614476525569",
  "nombre": "Admin",
  "apellido": "User",
  "email": "admin@test.com",
  "status": "active",
  "fechaNacimiento": "1990-01-01T00:00:00.000Z",
  "pais": "EC",
  "aceptaTerminos": "true",
  "roleId": "1097717614328152065",
  "createdAt": "2025-08-13T06:40:30.490Z"
}
```

### Rol típico:
```json
{
  "id": "1087853063759200257",
  "nombre": "admin",
  "descripcion": "cheverezzzzzzzzzzzzz",
  "createdAt": "2025-07-09T10:26:48.483Z"
}
```

### Permiso típico:
```json
{
  "id": "1087853063787020289",
  "nombre": "users:assign-role",
  "descripcion": "Asignar rol a un usuario",
  "createdAt": "2025-07-09T10:26:48.483Z"
}
```
