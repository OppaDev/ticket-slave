// src/api/services/websocket.service.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tickets-jwt-secret-super-secreto-2025';

class WebSocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId mapping
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
        
        console.log('✅ WebSocket Server inicializado en ms-tickets');
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
                
                console.log(`🔐 Usuario ${socket.userEmail} autenticado en WebSocket`);
                next();
            } catch (error) {
                console.error('❌ Error de autenticación WebSocket:', error.message);
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Cliente conectado: ${socket.userEmail} (${socket.id})`);
            
            // Mapear usuario a socket para notificaciones directas
            this.connectedUsers.set(socket.userId, socket.id);

            // Usuario se une a room de un evento específico (para stock updates)
            socket.on('join-event', (eventId) => {
                socket.join(`event-${eventId}`);
                console.log(`📍 Usuario ${socket.userEmail} se unió a event-${eventId}`);
                
                socket.emit('joined-event', { 
                    eventId, 
                    message: `Conectado a updates del evento ${eventId}` 
                });
            });

            // Usuario abandona room de evento
            socket.on('leave-event', (eventId) => {
                socket.leave(`event-${eventId}`);
                console.log(`🚪 Usuario ${socket.userEmail} abandonó event-${eventId}`);
            });

            // Usuario se une a sus propias notificaciones
            socket.on('join-user-notifications', () => {
                socket.join(`user-${socket.userId}`);
                console.log(`🔔 Usuario ${socket.userEmail} se unió a sus notificaciones`);
            });

            // Desconexión
            socket.on('disconnect', (reason) => {
                console.log(`🔌 Cliente desconectado: ${socket.userEmail} - Razón: ${reason}`);
                this.connectedUsers.delete(socket.userId);
            });

            // Heartbeat para mantener conexión
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() });
            });
        });
    }

    // ALTA PRIORIDAD: Notificar cambios de stock en tiempo real
    notifyStockUpdate(eventId, ticketTypeId, stockData) {
        if (!this.io) return;

        const updateData = {
            eventId,
            ticketTypeId,
            available: stockData.available,
            total: stockData.total,
            sold: stockData.sold,
            timestamp: new Date().toISOString()
        };

        // Notificar a todos los usuarios viendo este evento
        this.io.to(`event-${eventId}`).emit('stock-updated', updateData);
        
        console.log(`📊 Stock actualizado para evento ${eventId}, ticket ${ticketTypeId}: ${stockData.available} disponibles`);
    }

    // ALTA PRIORIDAD: Alertar cuando stock está bajo
    notifyLowStock(eventId, ticketTypeId, stockData) {
        if (!this.io) return;

        const alertData = {
            eventId,
            ticketTypeId,
            available: stockData.available,
            threshold: stockData.threshold || 10,
            message: `¡Solo quedan ${stockData.available} tickets disponibles!`,
            timestamp: new Date().toISOString()
        };

        this.io.to(`event-${eventId}`).emit('low-stock-alert', alertData);
        
        console.log(`⚠️ Alerta de stock bajo: evento ${eventId}, ticket ${ticketTypeId}`);
    }

    // ALTA PRIORIDAD: Notificar cuando carrito expira
    notifyCartExpired(userId, cartData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const expiredData = {
                cartId: cartData.id,
                expiredAt: cartData.expiresAt,
                itemsCount: cartData.itemsCount,
                message: 'Tu carrito ha expirado. Los tickets han sido liberados.',
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('cart-expired', expiredData);
            console.log(`⏰ Carrito expirado notificado a usuario ${userId}`);
        }
    }

    // ALTA PRIORIDAD: Notificar estado de pago en tiempo real
    notifyPaymentStatus(userId, paymentData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const paymentUpdate = {
                orderId: paymentData.orderId,
                status: paymentData.status, // 'processing', 'success', 'failed'
                amount: paymentData.amount,
                message: paymentData.message,
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('payment-status', paymentUpdate);
            console.log(`💳 Estado de pago ${paymentData.status} notificado a usuario ${userId}`);
        }
    }

    // ALTA PRIORIDAD: Notificar tickets generados exitosamente
    notifyTicketsGenerated(userId, ticketData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const ticketUpdate = {
                orderId: ticketData.orderId,
                ticketsGenerated: ticketData.ticketsCount,
                downloadUrl: ticketData.downloadUrl,
                message: `¡${ticketData.ticketsCount} tickets generados exitosamente!`,
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('tickets-generated', ticketUpdate);
            console.log(`🎫 Tickets generados notificados a usuario ${userId}`);
        }
    }

    // ALTA PRIORIDAD: Notificar validación de ticket en punto de entrada
    notifyTicketValidated(eventId, validationData) {
        if (!this.io) return;

        const validationUpdate = {
            eventId,
            ticketCode: validationData.ticketCode,
            userId: validationData.userId,
            validatedAt: validationData.timestamp,
            status: validationData.status, // 'valid', 'used', 'invalid'
            message: validationData.message,
            timestamp: new Date().toISOString()
        };

        // Notificar a organizadores del evento (si están conectados)
        this.io.to(`event-${eventId}`).emit('ticket-validated', validationUpdate);
        
        console.log(`✅ Validación de ticket notificada para evento ${eventId}`);
    }

    // Método para obtener estadísticas de conexiones
    getConnectionStats() {
        if (!this.io) return { connected: 0, rooms: [] };

        return {
            connected: this.connectedUsers.size,
            totalSockets: this.io.sockets.sockets.size,
            rooms: Array.from(this.io.sockets.adapter.rooms.keys()).filter(room => room.startsWith('event-')),
            timestamp: new Date().toISOString()
        };
    }

    // Método para enviar mensaje broadcast a todos los conectados
    broadcastMessage(event, data) {
        if (!this.io) return;
        
        this.io.emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📢 Mensaje broadcast enviado: ${event}`);
    }
}

module.exports = new WebSocketService();