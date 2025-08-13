# 🚀 Ticket Slave - Despliegue con Docker

## 📋 Arquitectura del Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                    PUERTO EXPUESTO: 709                    │
├─────────────────────────────────────────────────────────────┤
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                    Kong API Gateway                        │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ ms-usuarios  │  ms-eventos  │  ms-tickets  │ms-notifications│
│   :3010      │    :3005     │    :3000     │     :3001     │
├──────────────┴──────────────┴──────────────┴───────────────┤
│                    RabbitMQ (:5672)                        │
├─────────────────────────────────────────────────────────────┤
│          CockroachDB Cluster (3 nodos)                     │
│         Node1:26257  Node2:26258  Node3:26259             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Características del Despliegue

- **✅ Un solo puerto expuesto**: Puerto 709 para acceso externo
- **🔒 Comunicación interna**: Todos los servicios se comunican a través de Docker network
- **🌐 API Gateway**: Kong maneja el enrutamiento interno
- **📊 Alta disponibilidad**: CockroachDB con 3 nodos replicados
- **⚡ Messaging**: RabbitMQ para comunicación asíncrona
- **🔄 WebSockets**: Soporte completo para tiempo real

## 🚀 Despliegue Rápido

### Opción 1: Script automatizado (Recomendado)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Docker Compose manual
```bash
# Construir imágenes
docker-compose -f docker-compose.production.yml build

# Iniciar todo el sistema
docker-compose -f docker-compose.production.yml up -d

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

## 📊 Servicios Incluidos

| Servicio | Descripción | Red Interna | Puerto Expuesto |
|----------|-------------|-------------|-----------------|
| **Frontend** | Next.js App | 172.25.0.50:3000 | **709** ⭐ |
| **Kong Gateway** | API Gateway | 172.25.0.40:8000 | - |
| **ms-usuarios** | Autenticación | 172.25.0.30:3010 | - |
| **ms-eventos** | Gestión Eventos | 172.25.0.31:3005 | - |
| **ms-tickets** | Venta Tickets | 172.25.0.32:3000 | - |
| **ms-notifications** | Notificaciones | 172.25.0.33:3001 | - |
| **CockroachDB** | Base de datos | 172.25.0.10-12 | - |
| **RabbitMQ** | Message Broker | 172.25.0.20:5672 | - |

## 🛠️ URLs de Administración (Solo desarrollo local)

Para acceder a estas URLs, necesitas hacer port-forward temporal:

```bash
# CockroachDB UI
docker port crdb-node1 8080

# RabbitMQ Management
docker port rabbitmq 15672

# Kong Admin
docker port kong-gateway 8001
```

## 📋 Comandos Útiles

### Gestión de servicios
```bash
# Ver estado de todos los servicios
docker-compose -f docker-compose.production.yml ps

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f ms-tickets

# Reiniciar un servicio
docker-compose -f docker-compose.production.yml restart frontend

# Escalar un servicio (ejemplo: 2 instancias de ms-tickets)
docker-compose -f docker-compose.production.yml up -d --scale ms-tickets=2
```

### Debugging
```bash
# Conectar a un contenedor
docker exec -it ms-tickets /bin/sh
docker exec -it crdb-node1 /bin/sh

# Ver uso de recursos
docker stats

# Ver networks
docker network ls
docker network inspect ticketslave_app-network
```

### Mantenimiento
```bash
# Parar todo
docker-compose -f docker-compose.production.yml down

# Parar y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose -f docker-compose.production.yml down -v

# Reconstruir una imagen específica
docker-compose -f docker-compose.production.yml build --no-cache frontend

# Limpiar imágenes no utilizadas
docker image prune -f
```

## 🔧 Configuración Avanzada

### Variables de Entorno
Las variables críticas están configuradas en el `docker-compose.production.yml`:

```yaml
# Ejemplo para ms-tickets
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://root@crdb-node1:26257/ms_tickets?sslmode=disable
  JWT_SECRET: tickets-jwt-secret-super-secreto-2025
  RABBITMQ_URL: amqp://admin:password@rabbitmq:5672/
```

### Persistencia de Datos
Los siguientes volúmenes mantienen los datos:
- `cockroach1`, `cockroach2`, `cockroach3`: Datos de CockroachDB
- `rabbitmq_data`: Colas y mensajes de RabbitMQ

### Health Checks
Todos los servicios tienen health checks configurados:
- ✅ **Timeout**: 10-30 segundos
- ✅ **Reintentos**: 3-5 veces
- ✅ **Período inicial**: 30-60 segundos

## 🎯 Acceso a la Aplicación

Una vez desplegado, accede a:
**http://localhost:709**

El frontend automáticamente:
1. Se conecta a Kong Gateway internamente
2. Kong enruta las peticiones a los microservicios
3. Los microservicios se comunican entre sí
4. WebSockets funcionan para tiempo real
5. CockroachDB replica los datos entre nodos
6. RabbitMQ maneja mensajes asíncronos

## 🚨 Resolución de Problemas

### El frontend no carga
```bash
# Verificar estado
docker-compose -f docker-compose.production.yml ps frontend

# Ver logs
docker-compose -f docker-compose.production.yml logs frontend

# Verificar que Kong esté funcionando
curl http://localhost:709/api/v1/events
```

### Error de base de datos
```bash
# Verificar cluster CockroachDB
docker-compose -f docker-compose.production.yml logs crdb-node1

# Verificar que las bases de datos existan
docker exec crdb-node1 cockroach sql --insecure --execute "SHOW DATABASES;"
```

### Problemas de comunicación entre servicios
```bash
# Verificar la red interna
docker network inspect ticketslave_app-network

# Verificar conectividad
docker exec ms-tickets ping ms-usuarios
docker exec kong-gateway ping ms-tickets
```

## 📈 Monitoring

### Ver métricas en tiempo real
```bash
# CPU y memoria de todos los contenedores
docker stats

# Logs de todos los servicios
docker-compose -f docker-compose.production.yml logs -f
```

### CockroachDB Cluster Status
```bash
# Status del cluster
docker exec crdb-node1 cockroach node status --insecure

# Métricas de base de datos
docker exec crdb-node1 cockroach sql --insecure --execute "SELECT * FROM [SHOW CLUSTER SETTING cluster.organization];"
```

## 🎉 Producción Lista

Este setup está optimizado para:
- ✅ **Seguridad**: Solo puerto 709 expuesto
- ✅ **Escalabilidad**: CockroachDB distribuido + Kong load balancing
- ✅ **Monitoreo**: Health checks en todos los servicios
- ✅ **Performance**: Imágenes optimizadas Alpine Linux
- ✅ **Networking**: Red interna aislada
- ✅ **Persistencia**: Volúmenes para datos críticos

**🚀 ¡Tu aplicación está lista para producción en el puerto 709!**