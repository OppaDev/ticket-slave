# 🎫 Ticket Slave - Sistema de Gestión de Eventos

## 📋 Descripción

Sistema completo de microservicios para la gestión y venta de tickets de eventos con arquitectura distribuida, comunicación asíncrona y tiempo real.

## 🏗️ Arquitectura del Sistema

```
Frontend (Next.js) → Kong Gateway → Microservicios → CockroachDB + RabbitMQ
```

### Microservicios:
- **ms-usuarios** (Puerto 3010): Autenticación y autorización
- **ms-eventos** (Puerto 3005): Gestión de eventos y venues  
- **ms-tickets** (Puerto 3000): Venta de tickets y órdenes
- **ms-notifications** (Puerto 3001): Notificaciones y emails
- **Frontend** (Puerto 3002): Interfaz de usuario con Next.js

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local (Recomendado para desarrollo)

#### Pre-requisitos
- Node.js 18+
- Docker y Docker Compose
- Git

#### 1. Clonar el repositorio
```bash
git clone [tu-repo]
cd ticket-slave
```

#### 2. Instalar dependencias en todos los microservicios
```bash
# ms-usuarios
cd ms-usuarios && npm install && cd ..

# ms-eventos  
cd ms-eventos && npm install && cd ..

# ms-tickets
cd ms-tickets && npm install && cd ..

# ms-notifications
cd ms-notifications && npm install && cd ..

# Frontend
cd ticket-slave-frontend && npm install && cd ..
```

#### 3. Levantar infraestructura (CockroachDB + RabbitMQ)
```bash
docker-compose up -d
```

#### 4. Iniciar Kong Gateway
```bash
cd gateway && docker-compose up -d kong && cd ..
```

#### 5. Iniciar cada microservicio (en terminales separadas)
```bash
# Terminal 1: ms-usuarios
cd ms-usuarios && npm run dev

# Terminal 2: ms-eventos  
cd ms-eventos && npm run dev

# Terminal 3: ms-tickets
cd ms-tickets && npm run dev

# Terminal 4: ms-notifications
cd ms-notifications && npm run dev

# Terminal 5: Frontend
cd ticket-slave-frontend && npm run dev
```

#### 6. Acceder a la aplicación
- **Frontend**: http://localhost:3002
- **API Gateway**: http://localhost:8000
- **CockroachDB UI**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (admin/password)

### Opción 2: Docker Completo (Recomendado para producción)

#### Despliegue automático
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Despliegue manual
```bash
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

#### Acceso
- **Aplicación completa**: http://localhost:709 ⭐

## 🔧 Configuración

### Variables de Entorno

Cada microservicio requiere su archivo `.env`:

#### ms-usuarios/.env
```env
NODE_ENV=development
PORT=3010
DATABASE_URL=postgresql://root@localhost:26257/ms_usuarios?sslmode=disable
JWT_SECRET=tickets-jwt-secret-super-secreto-2025
DB_DIALECT=postgres
```

#### ms-eventos/.env
```env
NODE_ENV=development
PORT=3005
DATABASE_URL=postgresql://root@localhost:26257/ms_eventos?sslmode=disable
JWT_SECRET=tickets-jwt-secret-super-secreto-2025
DB_DIALECT=postgres
RABBITMQ_URL=amqp://admin:password@localhost:5672/
```

#### ms-tickets/.env
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://root@localhost:26257/ms_tickets?sslmode=disable
JWT_SECRET=tickets-jwt-secret-super-secreto-2025
DB_DIALECT=postgres
RABBITMQ_URL=amqp://admin:password@localhost:5672/
FRONTEND_URL=http://localhost:3002
```

#### ms-notifications/.env
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://root@localhost:26257/ms_notifications?sslmode=disable
JWT_SECRET=tickets-jwt-secret-super-secreto-2025
DB_DIALECT=postgres
RABBITMQ_URL=amqp://admin:password@localhost:5672/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### ticket-slave-frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

## 📊 Datos de Prueba

### Usuarios predefinidos:
```
admin@test.com / password123 (admin)
organizer@test.com / password123 (organizer)
customer@test.com / password123 (customer)
```

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Ver logs de infraestructura
docker-compose logs -f

# Reiniciar CockroachDB
docker-compose restart cockroach1

# Ver estado de RabbitMQ
curl http://localhost:15672

# Linter en microservicios
cd ms-tickets && npm run lint

# Tests
cd ms-tickets && npm test
```

### Producción Docker
```bash
# Ver todos los servicios
docker-compose -f docker-compose.production.yml ps

# Ver logs de un servicio
docker-compose -f docker-compose.production.yml logs -f frontend

# Reiniciar un servicio
docker-compose -f docker-compose.production.yml restart ms-tickets

# Parar todo
docker-compose -f docker-compose.production.yml down
```

## 📋 Testing con Postman

1. Importar colección: `Ticket_Slave_API_Gateway.postman_collection.json`
2. Importar environment: `Ticket_Slave_Environment.postman_environment.json`
3. Seguir el flujo en `POSTMAN_README.md`

## 🔄 Flujo de Desarrollo

### 1. Autenticación
```bash
POST http://localhost:8000/api/v1/auth/login
```

### 2. Crear Evento
```bash
POST http://localhost:8000/api/v1/events
```

### 3. Añadir Tickets al Carrito
```bash
POST http://localhost:8000/api/v1/cart/items
```

### 4. Procesar Pago
```bash
POST http://localhost:8000/api/v1/orders
```

## 🚨 Resolución de Problemas

### CockroachDB lento
```bash
# Reiniciar cluster
docker-compose down && docker-compose up -d

# Verificar salud del cluster
curl http://localhost:8080/health
```

### RabbitMQ no conecta
```bash
# Verificar contenedor
docker logs rabbitmq

# Reiniciar RabbitMQ
docker-compose restart rabbitmq
```

### Kong Gateway error
```bash
# Verificar configuración
curl http://localhost:8001

# Reiniciar Kong
cd gateway && docker-compose restart kong
```

### Puerto ocupado
```bash
# Windows: Matar proceso en puerto
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac: Matar proceso
lsof -ti:3000 | xargs kill -9
```

## 📂 Estructura del Proyecto

```
ticket-slave/
├── ms-usuarios/          # Microservicio de usuarios
├── ms-eventos/           # Microservicio de eventos  
├── ms-tickets/           # Microservicio de tickets
├── ms-notifications/     # Microservicio de notificaciones
├── ticket-slave-frontend/# Frontend Next.js
├── gateway/              # Kong API Gateway
├── docker-compose.yml    # Infraestructura desarrollo
├── docker-compose.production.yml  # Deploy completo
├── deploy.sh            # Script de despliegue
└── README-DOCKER.md     # Documentación Docker
```

## 🎯 Características Principales

- ✅ **Arquitectura de Microservicios**
- ✅ **CockroachDB Distribuido** (3 nodos)
- ✅ **Kong API Gateway**
- ✅ **RabbitMQ** para messaging
- ✅ **WebSockets** tiempo real
- ✅ **Autenticación JWT**
- ✅ **Frontend moderno** Next.js + TypeScript
- ✅ **Docker containerizado**
- ✅ **Health checks**
- ✅ **Colección Postman** completa

## 👥 Contribución

1. Fork el proyecto
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**🚀 ¡Listo para usar! Sigue las instrucciones de inicio rápido y tendrás el sistema funcionando en minutos.**