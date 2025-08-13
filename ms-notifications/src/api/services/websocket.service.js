// src/api/services/websocket.service.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'notifications-jwt-secret-super-secreto-2025';

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
        
        console.log('✅ WebSocket Server inicializado en ms-notifications');
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
                socket.userRole = payload.role || 'customer';
                
                console.log(`🔐 Usuario ${socket.userEmail} autenticado en WebSocket (notifications)`);
                next();
            } catch (error) {
                console.error('❌ Error de autenticación WebSocket:', error.message);
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Usuario conectado a notificaciones: ${socket.userEmail} (${socket.id})`);
            
            // Mapear usuario a socket para notificaciones directas
            this.connectedUsers.set(socket.userId, socket.id);

            // Usuario se une a sus notificaciones personales
            socket.on('join-notifications', () => {
                socket.join(`user-${socket.userId}`);
                console.log(`🔔 Usuario ${socket.userEmail} se unió a sus notificaciones`);
                
                socket.emit('notifications-joined', { 
                    message: 'Conectado a notificaciones push',
                    userId: socket.userId
                });
            });

            // Usuario se suscribe a notificaciones de un evento específico
            socket.on('subscribe-event-notifications', (eventId) => {
                socket.join(`event-notifications-${eventId}`);
                console.log(`📅 Usuario ${socket.userEmail} se suscribió a notificaciones del evento ${eventId}`);
                
                socket.emit('event-subscribed', { 
                    eventId,
                    message: `Suscrito a notificaciones del evento ${eventId}` 
                });
            });

            // Usuario se desuscribe de notificaciones de evento
            socket.on('unsubscribe-event-notifications', (eventId) => {
                socket.leave(`event-notifications-${eventId}`);
                console.log(`🚪 Usuario ${socket.userEmail} se desuscribió del evento ${eventId}`);
            });

            // Marcar notificación como leída
            socket.on('mark-notification-read', (notificationId) => {
                // Aquí podrías actualizar el estado en base de datos
                console.log(`👁️ Usuario ${socket.userEmail} marcó notificación ${notificationId} como leída`);
                
                socket.emit('notification-read-confirmed', { 
                    notificationId,
                    readAt: new Date().toISOString()
                });
            });

            // Desconexión
            socket.on('disconnect', (reason) => {
                console.log(`🔌 Usuario desconectado de notificaciones: ${socket.userEmail} - Razón: ${reason}`);
                this.connectedUsers.delete(socket.userId);
            });

            // Heartbeat
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() });
            });
        });
    }

    // MEDIA PRIORIDAD: Enviar notificación push en tiempo real
    sendPushNotification(userId, notificationData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const pushNotification = {
                id: notificationData.id || `notif_${Date.now()}`,
                type: notificationData.type || 'info', // 'success', 'warning', 'error', 'info'
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data || {},
                priority: notificationData.priority || 'normal', // 'high', 'normal', 'low'
                requiresAction: notificationData.requiresAction || false,
                timestamp: new Date().toISOString(),
                expiresAt: notificationData.expiresAt
            };

            this.io.to(socketId).emit('push-notification', pushNotification);
            console.log(`🔔 Push notification enviada a usuario ${userId}: ${notificationData.title}`);
            
            return true; // Indicar que se envió exitosamente
        }
        
        console.log(`⚠️ Usuario ${userId} no conectado para push notification`);
        return false; // Usuario no conectado
    }

    // MEDIA PRIORIDAD: Notificar estado de entrega de email
    notifyEmailDeliveryStatus(userId, emailData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const deliveryUpdate = {
                emailId: emailData.emailId,
                recipient: emailData.recipient,
                status: emailData.status, // 'sent', 'failed', 'delivered', 'opened'
                subject: emailData.subject,
                sentAt: emailData.sentAt,
                deliveredAt: emailData.deliveredAt,
                error: emailData.error,
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('email-status', deliveryUpdate);
            console.log(`📧 Estado de email notificado a usuario ${userId}: ${emailData.status}`);
        }
    }

    // MEDIA PRIORIDAD: Notificar a usuarios suscritos sobre cambios de evento
    notifyEventUpdate(eventId, updateData) {
        if (!this.io) return;

        const eventNotification = {
            eventId,
            updateType: updateData.updateType, // 'date_change', 'venue_change', 'cancelled', 'published'
            title: updateData.title,
            message: updateData.message,
            oldValue: updateData.oldValue,
            newValue: updateData.newValue,
            actionRequired: updateData.actionRequired || false,
            timestamp: new Date().toISOString()
        };

        // Notificar a todos los usuarios suscritos al evento
        this.io.to(`event-notifications-${eventId}`).emit('event-update-notification', eventNotification);
        
        console.log(`📅 Notificación de cambio de evento enviada para evento ${eventId}: ${updateData.updateType}`);
    }

    // MEDIA PRIORIDAD: Notificaciones del sistema (mantenimiento, alertas)
    sendSystemNotification(notificationData, targetUsers = null) {
        if (!this.io) return;

        const systemNotification = {
            id: `system_${Date.now()}`,
            type: 'system',
            category: notificationData.category || 'general', // 'maintenance', 'security', 'feature', 'general'
            title: notificationData.title,
            message: notificationData.message,
            severity: notificationData.severity || 'info', // 'critical', 'warning', 'info'
            actionUrl: notificationData.actionUrl,
            dismissible: notificationData.dismissible !== false,
            timestamp: new Date().toISOString()
        };

        if (targetUsers && Array.isArray(targetUsers)) {
            // Enviar a usuarios específicos
            targetUsers.forEach(userId => {
                const socketId = this.connectedUsers.get(userId);
                if (socketId) {
                    this.io.to(socketId).emit('system-notification', systemNotification);
                }
            });
            console.log(`🔧 Notificación del sistema enviada a ${targetUsers.length} usuarios específicos`);
        } else {
            // Broadcast a todos los usuarios conectados
            this.io.emit('system-notification', systemNotification);
            console.log(`🔧 Notificación del sistema enviada a todos los usuarios conectados`);
        }
    }

    // MEDIA PRIORIDAD: Confirmar recepción de notificación crítica
    sendCriticalNotification(userId, notificationData) {
        if (!this.io) return;

        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            const criticalNotification = {
                id: notificationData.id || `critical_${Date.now()}`,
                type: 'critical',
                title: notificationData.title,
                message: notificationData.message,
                requiresConfirmation: true,
                confirmationTimeout: notificationData.timeout || 30000, // 30 segundos por defecto
                data: notificationData.data || {},
                timestamp: new Date().toISOString()
            };

            this.io.to(socketId).emit('critical-notification', criticalNotification);
            console.log(`🚨 Notificación crítica enviada a usuario ${userId}: ${notificationData.title}`);
            
            // Configurar timeout para confirmación
            setTimeout(() => {
                this.io.to(socketId).emit('critical-notification-timeout', {
                    notificationId: criticalNotification.id,
                    message: 'Tiempo de confirmación agotado'
                });
            }, criticalNotification.confirmationTimeout);
        }
    }

    // Método para obtener estadísticas de notificaciones
    getNotificationStats() {
        if (!this.io) return { connected: 0, rooms: [] };

        return {
            connectedUsers: this.connectedUsers.size,
            totalSockets: this.io.sockets.sockets.size,
            eventSubscriptions: Array.from(this.io.sockets.adapter.rooms.keys())
                .filter(room => room.startsWith('event-notifications-')).length,
            userRooms: Array.from(this.io.sockets.adapter.rooms.keys())
                .filter(room => room.startsWith('user-')).length,
            timestamp: new Date().toISOString()
        };
    }

    // Verificar si un usuario está conectado
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }

    // Obtener lista de usuarios conectados
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
}

module.exports = new WebSocketService();