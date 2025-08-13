# Ticket Slave Frontend

Frontend desarrollado con **Next.js 15**, **TypeScript**, **Tailwind CSS** y **Shadcn/UI** para el sistema de gestión de tickets.

## 🚀 Características

- ✅ **Next.js 15** con App Router
- ✅ **TypeScript** para type safety
- ✅ **Tailwind CSS** para styling responsive
- ✅ **Shadcn/UI** para componentes accesibles
- ✅ **Socket.IO** para tiempo real
- ✅ **Axios** para API calls
- ✅ **React Hook Form + Zod** para formularios
- ✅ **Sonner** para notificaciones

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── app/                     # App Router (Next.js 13+)
│   ├── (auth)/             # Grupo de rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/        # Grupo de rutas del dashboard
│   ├── events/             # Páginas de eventos
│   ├── cart/               # Carrito de compras
│   ├── orders/             # Órdenes de compra
│   └── tickets/            # Tickets del usuario
├── components/
│   ├── ui/                 # Componentes Shadcn/UI
│   ├── forms/              # Formularios personalizados
│   ├── charts/             # Gráficos para dashboard
│   ├── realtime/           # Componentes WebSocket
│   └── providers/          # Context Providers
├── hooks/                  # Custom hooks
│   ├── use-auth.ts         # Autenticación
│   ├── use-websocket.ts    # WebSocket hooks
│   └── use-cart.ts         # Carrito de compras
├── lib/
│   ├── api.ts              # Cliente de API (Kong Gateway)
│   ├── websocket.ts        # WebSocket connections
│   ├── auth-context.ts     # Context de autenticación
│   └── utils.ts            # Utilidades
└── types/
    └── index.ts            # Definiciones TypeScript
```

## 🔌 Integración con Backend

### API Gateway (Kong)
- **Base URL:** `http://localhost:8000`
- **Autenticación:** JWT en header `Authorization: Bearer <token>`
- **WebSockets:** Conexión a través de Kong con upgrade HTTP

### Endpoints Principales
```typescript
// Autenticación
POST /api/v1/auth/login
POST /api/v1/auth/register

// Eventos
GET /api/v1/events
GET /api/v1/events/:id

// Tickets
GET /api/v1/events/:eventId/ticket-types
POST /api/v1/cart/items
POST /api/v1/orders

// WebSocket
WS /ws-tickets      # Stock y pagos en tiempo real
WS /ws-eventos      # Dashboard organizador
WS /ws-notifications # Push notifications
```

## 🔄 WebSocket en Tiempo Real

### Tickets WebSocket
```typescript
const { joinEvent, onStockUpdate, onPaymentStatus } = useTicketsWebSocket()

// Suscribirse a updates de stock
joinEvent(eventId)
onStockUpdate((data) => {
  console.log(`Stock actualizado: ${data.available} tickets`)
})
```

### Dashboard Organizador
```typescript
const { joinEventDashboard, onNewSale } = useEventsWebSocket()

// Monitorear ventas en tiempo real
joinEventDashboard(eventId)
onNewSale((sale) => {
  console.log(`Nueva venta: $${sale.totalAmount}`)
})
```

## 🔐 Sistema de Autenticación

### Context de Auth
```typescript
const { user, login, logout, isAuthenticated } = useAuth()

// Login
await login(email, password)

// Verificar roles
const { isAdmin, isOrganizer, isCustomer } = useAuth()
```

### Rutas Protegidas
```typescript
// Hook para proteger rutas
const { user } = useProtectedRoute(['admin', 'organizer'])
```

## 🎨 Componentes UI

### Shadcn/UI Instalados
- `button` - Botones con variantes
- `card` - Cards para contenido
- `form` - Formularios con validación
- `input` - Inputs con estilos
- `select` - Dropdowns
- `dialog` - Modales
- `badge` - Badges de estado
- `sonner` - Notificaciones toast

### Ejemplo de Uso
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Evento</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Comprar Tickets</Button>
  </CardContent>
</Card>
```

## 📱 Responsive Design

- **Mobile-first:** Diseño optimizado para móviles
- **Breakpoints:** sm, md, lg, xl (Tailwind)
- **Componentes adaptativos:** Grids y layouts flexibles

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Lint
npm run lint

# Type checking
npm run type-check
```

## 🌐 Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3002
NODE_ENV=development
```

## 🔧 Configuración

### Next.js Config
- App Router habilitado
- TypeScript strict mode
- Tailwind CSS integrado
- Path aliases configurados (`@/*`)

### ESLint Config
- Reglas de Next.js
- TypeScript rules (warnings)
- Prettier integración

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conectar repositorio y deploy automático
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Estructura de Datos

### Tipos Principales
```typescript
interface Event {
  id: string
  nombre: string
  fechaInicio: string
  venue?: Venue
  category?: Category
  ticketTypes?: TicketType[]
}

interface User {
  id: string
  nombre: string
  email: string
  role?: Role
}

interface Cart {
  items: CartItem[]
  expiresAt: string
}
```

## 🔮 Próximas Mejoras

- [ ] PWA (Progressive Web App)
- [ ] Server Components optimization
- [ ] Image optimization
- [ ] SEO metadata dinámico
- [ ] Tests unitarios (Jest/Testing Library)
- [ ] Storybook para componentes
- [ ] Bundle analyzer
- [ ] Performance monitoring

## 🔗 Enlaces

- **Frontend:** http://localhost:3002
- **API Gateway (Kong):** http://localhost:8000
- **Documentación Backend:** Ver `CLAUDE.md` en raíz del proyecto

---

**Desarrollado con ❤️ usando Next.js + Shadcn/UI**