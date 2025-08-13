// api/services/websocket.service.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eventos-jwt-secret-super-secreto-2025';

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedOrganizers = new Map(); // organizerId -> socketId mapping
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            path: '/ws'
        });

        this.setupAuthentication();
        this.setupEventHandlers();
        
        console.log('✅ WebSocket Server inicializado en ms-eventos');
    }

    setupAuthentication() {
        // Middleware de autenticación para WebSockets
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                
                if (!token) {
                    return next(new Error('No token provided'));
                }

                const payload = jwt.verify(token, JWT_SECRET);
                socket.userId = payload.sub;
                socket.userEmail = payload.email;
                socket.userRole = payload.role;
                
                // Solo permitir admin y organizers
                if (socket.userRole !== 'admin' && socket.userRole !== 'organizer') {
                    return next(new Error('Insufficient permissions'));
                }
                
                console.log(`🔐 Organizador ${socket.userEmail} autenticado en WebSocket`);
                next();
            } catch (error) {
                console.error('❌ Error de autenticación WebSocket:', error.message);
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Organizador conectado: ${socket.userEmail} (${socket.id})`);
            
            // Mapear organizador a socket
            this.connectedOrganizers.set(socket.userId, socket.id);

            // Organizador se une a su dashboard personal
            socket.on('join-organizer-dashboard', () => {
                socket.join(`organizer-${socket.userId}`);
                console.log(`📊 Organizador ${socket.userEmail} se unió a su dashboard`);
                
                socket.emit('dashboard-joined', { 
                    message: 'Conectado al dashboard de organizador',
                    organizerId: socket.userId
                });
            });

            // Organizador se une a room de evento específico
            socket.on('join-event-dashboard', (eventId) => {
                socket.join(`event-dashboard-${eventId}`);
                console.log(`📈 Organizador ${socket.userEmail} monitoreando evento ${eventId}`);
                
                socket.emit('event-dashboard-joined', { 
                    eventId,
                    message: `Monitoreando evento ${eventId}` 
                });
            });

            // Organizador abandona room de evento
            socket.on('leave-event-dashboard', (eventId) => {
                socket.leave(`event-dashboard-${eventId}`);
                console.log(`🚪 Organizador ${socket.userEmail} dejó de monitorear evento ${eventId}`);
            });

            // Desconexión
            socket.on('disconnect', (reason) => {
                console.log(`🔌 Organizador desconectado: ${socket.userEmail} - Razón: ${reason}`);
                this.connectedOrganizers.delete(socket.userId);
            });

            // Heartbeat
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() });
            });
        });
    }

    // MEDIA PRIORIDAD: Notificar nueva venta a organizadores
    notifyNewSale(eventId, saleData) {
        if (!this.io) return;

        const saleNotification = {
            eventId,
            orderId: saleData.orderId,
            userId: saleData.userId,
            userEmail: saleData.userEmail,
            totalAmount: saleData.totalAmount,
            ticketsCount: saleData.ticketsCount,
            ticketTypes: saleData.ticketTypes,
            timestamp: new Date().toISOString()
        };

        // Notificar a organizadores monitoreando este evento
        this.io.to(`event-dashboard-${eventId}`).emit('new-sale', saleNotification);
        
        console.log(`💰 Nueva venta notificada para evento ${eventId}: $${saleData.totalAmount}`);
    }

    // MEDIA PRIORIDAD: Notificar estadísticas de ventas actualizadas
    notifySalesStats(eventId, statsData) {
        if (!this.io) return;

        const statsUpdate = {
            eventId,
            totalSales: statsData.totalSales,
            totalRevenue: statsData.totalRevenue,
            ticketsSold: statsData.ticketsSold,
            ticketsRemaining: statsData.ticketsRemaining,
            conversionRate: statsData.conversionRate,
            timestamp: new Date().toISOString()
        };

        this.io.to(`event-dashboard-${eventId}`).emit('sales-stats-updated', statsUpdate);
        
        console.log(`📊 Stats de ventas actualizadas para evento ${eventId}`);
    }

    // MEDIA PRIORIDAD: Notificar evento publicado
    notifyEventPublished(eventData, organizerId) {
        if (!this.io) return;

        const publishNotification = {
            eventId: eventData.id,
            eventName: eventData.nombre,
            eventDate: eventData.fechaInicio,
            publishedAt: new Date().toISOString(),
            message: `Evento "${eventData.nombre}" publicado exitosamente`
        };

        // Notificar al organizador específico
        this.io.to(`organizer-${organizerId}`).emit('event-published', publishNotification);
        
        console.log(`🎉 Evento publicado notificado a organizador ${organizerId}`);
    }

    // MEDIA PRIORIDAD: Notificar validaciones de tickets en tiempo real
    notifyTicketValidations(eventId, validationData) {
        if (!this.io) return;

        const validationUpdate = {
            eventId,
            ticketCode: validationData.ticketCode,
            validatedAt: validationData.timestamp,
            gateNumber: validationData.gateNumber || 'Principal',
            attendeeCount: validationData.attendeeCount,
            timestamp: new Date().toISOString()
        };

        this.io.to(`event-dashboard-${eventId}`).emit('ticket-validation', validationUpdate);
        
        console.log(`✅ Validación de ticket notificada para evento ${eventId}`);
    }

    // MEDIA PRIORIDAD: Alertas del sistema para organizadores
    notifySystemAlert(organizerId, alertData) {
        if (!this.io) return;

        const socketId = this.connectedOrganizers.get(organizerId);
        if (socketId) {
            const alert = {
                type: alertData.type, // 'warning', 'error', 'info'
                title: alertData.title,
                message: alertData.message,
                severity: alertData.severity || 'medium',
                actionRequired: alertData.actionRequired || false,
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('system-alert', alert);
            console.log(`🚨 Alerta del sistema enviada a organizador ${organizerId}: ${alertData.type}`);
        }
    }

    // MEDIA PRIORIDAD: Notificar cambios en eventos
    notifyEventUpdate(eventId, updateData, organizerId) {
        if (!this.io) return;

        const updateNotification = {
            eventId,
            changeType: updateData.changeType, // 'venue', 'date', 'price', 'description'
            oldValue: updateData.oldValue,
            newValue: updateData.newValue,
            updatedBy: updateData.updatedBy,
            timestamp: new Date().toISOString()
        };

        // Notificar a organizadores monitoreando este evento
        this.io.to(`event-dashboard-${eventId}`).emit('event-updated', updateNotification);
        
        console.log(`📝 Cambio en evento ${eventId} notificado: ${updateData.changeType}`);
    }

    // Método para obtener estadísticas de dashboard en tiempo real
    async getDashboardStats(organizerId, eventId = null) {
        // Este método podría consultar la base de datos para stats en tiempo real
        // Por ahora retorna estructura básica
        return {
            organizerId,
            eventId,
            connectedClients: this.connectedOrganizers.size,
            activeEvents: Array.from(this.io.sockets.adapter.rooms.keys())
                .filter(room => room.startsWith('event-dashboard-')).length,
            timestamp: new Date().toISOString()
        };
    }

    // Método para broadcast a todos los organizadores
    broadcastToOrganizers(event, data) {
        if (!this.io) return;
        
        this.io.emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📢 Broadcast a organizadores: ${event}`);
    }
}

module.exports = new WebSocketService();