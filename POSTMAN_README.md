# 🚀 Colección Postman - Ticket Slave API Gateway

## 📋 Descripción

Colección completa de Postman para probar todos los endpoints del sistema de microservicios **Ticket Slave** a través de **Kong Gateway**.

## 🏗️ Arquitectura Cubierta

- **Kong Gateway**: Puerto 8000 (API Gateway)
- **ms-usuarios**: Puerto 3010 (Autenticación, Usuarios, Roles, Permisos)
- **ms-eventos**: Puerto 3005 (Eventos, Categorías, Venues, Zonas)
- **ms-tickets**: Puerto 3000 (Tickets, Órdenes, Carrito)
- **ms-notifications**: Puerto 3001 (Health check)

## 📦 Archivos Incluidos

1. **`Ticket_Slave_API_Gateway.postman_collection.json`** - Colección principal con todos los endpoints
2. **`Ticket_Slave_Environment.postman_environment.json`** - Variables de entorno preconfiguradas
3. **`POSTMAN_README.md`** - Esta guía de uso

## 🔧 Instalación y Configuración

### 1. Importar en Postman

1. Abrir Postman
2. Click en **Import** (botón superior izquierdo)
3. Arrastrar ambos archivos JSON:
   - `Ticket_Slave_API_Gateway.postman_collection.json`
   - `Ticket_Slave_Environment.postman_environment.json`
4. Click **Import**

### 2. Configurar Entorno

1. En Postman, seleccionar el entorno **"Ticket Slave - Development"** (esquina superior derecha)
2. Verificar que `gateway_url` esté configurado como `http://localhost:8000`

### 3. Verificar Servicios

Asegúrate de que todos los servicios estén ejecutándose:

```bash
# Verificar Kong Gateway
curl http://localhost:8000/

# Verificar microservicios
curl http://localhost:3010/status  # ms-usuarios
curl http://localhost:3005/status  # ms-eventos  
curl http://localhost:3000/status  # ms-tickets
curl http://localhost:3001/status  # ms-notifications
```

## 🎯 Guía de Uso

### 📝 Orden Recomendado de Testing

#### 1. **🔐 Autenticación (OBLIGATORIO PRIMERO)**
```
Authentication > Login
```
- Ejecutar **Login** con cualquiera de los 3 usuarios predefinidos
- El JWT token se guarda automáticamente en `{{jwt_token}}`
- Todos los endpoints protegidos usan automáticamente este token

**Usuarios predefinidos:**
- `admin@test.com` / `password` (rol: admin)
- `organizer@test.com` / `password` (rol: organizer)  
- `customer@test.com` / `password` (rol: customer)

#### 2. **👥 Gestión de Usuarios** (Requiere admin)
```
Users Management > Get All Users
Roles & Permissions > Get All Roles
```

#### 3. **📂 Datos Base** (Público)
```
Categories > Get All Categories
Venues & Zones > Get All Venues
```

#### 4. **🎪 Gestión de Eventos** (Requiere organizer/admin)
```
Events Management > Create Event
Events Management > Get Event by ID  
Events Management > Publish Event
```

#### 5. **🎫 Tipos de Ticket** (Requiere organizer/admin)
```
Ticket Management > Create Ticket Type
Ticket Management > Get Event Ticket Types
```

#### 6. **🛒 Flujo de Compra** (Requiere customer)
```
Shopping Cart > Add Item to Cart
Shopping Cart > Get Cart
Orders Management > Create Order (Process Payment)
Orders Management > Get Order by ID
```

#### 7. **🎟️ Tickets del Usuario**
```
User Tickets > Get User Tickets  
User Tickets > Get Ticket by ID
```

### 🔄 Variables Automáticas

La colección guarda automáticamente IDs importantes:

| Variable | Se guarda en | Usado por |
|----------|--------------|-----------|
| `jwt_token` | Login | Todos los endpoints protegidos |
| `event_id` | Create Event | Ticket types, cart, etc. |
| `category_id` | Create Category | Create Event |
| `venue_id` | Create Venue | Create Event, zones |
| `ticket_type_id` | Create Ticket Type | Add to cart |
| `order_id` | Create Order | Get order, refund |

### 📊 Funcionalidades Principales Cubiertas

#### ✅ **Autenticación y Autorización**
- [x] Login/Logout con JWT
- [x] Registro de usuarios  
- [x] Recuperación de contraseña
- [x] Gestión de roles y permisos
- [x] Control de acceso por rol

#### ✅ **Gestión de Eventos**
- [x] CRUD completo de eventos
- [x] Workflow: BORRADOR → PUBLICADO
- [x] Paginación y filtros
- [x] Control de ownership (organizer)

#### ✅ **Gestión de Venues**
- [x] CRUD venues con geolocalización
- [x] CRUD zonas por venue
- [x] Capacidades y configuración

#### ✅ **Sistema de Tickets**
- [x] Tipos de ticket con precios y stock
- [x] Carrito con reserva temporal (15 min)
- [x] Procesamiento de órdenes
- [x] Generación de tickets QR
- [x] Validación en punto de entrada

#### ✅ **E-commerce Completo**
- [x] Shopping cart funcional
- [x] Procesamiento de pagos simulado
- [x] Historial de órdenes
- [x] Sistema de reembolsos

### 🔍 Endpoints de Monitoreo

```
Status & Health > Kong Gateway Status
Status & Health > MS-Eventos Status  
Status & Health > MS-Notifications Health
```

## 🎨 Organización de la Colección

### 📁 **Carpetas Principales**

- **🔐 Authentication** (6 endpoints)
- **👥 Users Management** (6 endpoints) 
- **🎭 Roles & Permissions** (12 endpoints)
- **🎪 Events Management** (5 endpoints)
- **📂 Categories** (5 endpoints)
- **🏟️ Venues & Zones** (10 endpoints)
- **🎫 Ticket Management** (5 endpoints)
- **🛒 Shopping Cart** (4 endpoints)
- **📝 Orders Management** (4 endpoints)
- **🎟️ User Tickets** (3 endpoints)
- **📧 Notifications** (1 endpoint)
- **🔍 Status & Health** (3 endpoints)

**Total: 64+ endpoints cubiertos**

## ⚙️ Configuración Avanzada

### 🔧 Scripts Automáticos

La colección incluye **scripts automáticos** que:

1. **Guardan tokens JWT** automáticamente al hacer login
2. **Extraen IDs** de respuestas para usar en siguientes requests  
3. **Validan respuestas** con tests básicos
4. **Muestran logs** útiles en la consola de Postman

### 🌍 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `gateway_url` | URL del Kong Gateway | `http://localhost:8000` |
| `jwt_token` | Token JWT (auto) | *(se llena automáticamente)* |
| `admin_email` | Email del admin | `admin@test.com` |
| `organizer_email` | Email del organizador | `organizer@test.com` |
| `customer_email` | Email del cliente | `customer@test.com` |
| `default_password` | Contraseña por defecto | `password` |
| `category_id` | ID de categoría existente | `1097657245997400065` |
| `venue_id` | ID de venue existente | `1097657561182666753` |

## 🚨 Troubleshooting

### ❌ Errores Comunes

#### **"Failed to connect"**
```bash
# Verificar que Kong esté ejecutándose
docker ps | grep kong

# Verificar que los microservicios estén activos  
curl http://localhost:3010/status
```

#### **"Unauthorized" (401)**
```
1. Ejecutar primero Authentication > Login
2. Verificar que {{jwt_token}} tenga valor
3. Verificar que el usuario tenga permisos para el endpoint
```

#### **"Not Found" (404)**  
```
1. Verificar que el ID en la URL sea válido
2. Usar primero endpoints de creación para generar IDs
3. Verificar que las variables estén pobladas
```

#### **"Validation Error" (400)**
```
1. Revisar el JSON del body
2. Verificar campos requeridos  
3. Verificar formatos de fecha (ISO 8601)
```

### ✅ **Testing Exitoso**

Si todo está bien configurado, deberías poder:

1. ✅ Hacer login y obtener token
2. ✅ Crear un evento con success (201)
3. ✅ Agregar tipos de ticket  
4. ✅ Añadir items al carrito
5. ✅ Procesar una orden completa

## 📈 Flujo E2E Recomendado

### 🛒 **Flujo Completo de Compra**

```
1. Authentication > Login (customer)
2. Categories > Get All Categories  
3. Events Management > Get All Events
4. Ticket Management > Get Event Ticket Types  
5. Shopping Cart > Add Item to Cart
6. Shopping Cart > Get Cart
7. Orders Management > Create Order
8. User Tickets > Get User Tickets  
9. User Tickets > Validate Ticket
```

## 🔮 Extensiones Futuras

La colección está preparada para:

- [ ] **WebSocket testing** (cuando se implemente en Postman)
- [ ] **Pruebas de carga** con Postman Monitor
- [ ] **Tests automatizados** con Newman CLI
- [ ] **CI/CD integration** con pipelines

---

## 📞 Soporte

Si encuentras problemas:

1. **Verificar logs de Kong**: `docker logs gateway-kong-1`
2. **Verificar logs de microservicios**: Revisar consolas de cada servicio
3. **Verificar variables**: En Postman > Environment > Current values
4. **Verificar autenticación**: Que el token JWT esté presente y válido

---

**¡Listo para probar! 🚀**

La colección está completamente funcional y cubre todos los aspectos del sistema Ticket Slave a través del API Gateway.