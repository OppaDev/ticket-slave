// src/api/services/notification.service.js
const emailService = require('./email.service');
const { NotificationLog } = require('../models');
const websocketService = require('./websocket.service');

class NotificationService {
    /**
     * Procesa un evento de compra completada.
     * @param {object} eventData - Los datos del evento desde RabbitMQ.
     */
    async handlePurchaseCompleted(eventData) {
        // En un sistema real, el evento de compra debería incluir los datos del usuario.
        // Aquí simulamos que los recibimos.
        const { userEmail, userName, orderDetails } = eventData;
        
        if (!userEmail || !orderDetails) {
            console.error('Error: Faltan datos en el evento de compra completada.', eventData);
            return;
        }

        const subject = `Confirmación de tu pedido #${orderDetails.codigoPedido}`;
        const htmlContent = `
            <h1>¡Gracias por tu compra, ${userName || 'cliente'}!</h1>
            <p>Hemos recibido tu pedido con código <strong>${orderDetails.codigoPedido}</strong>.</p>
            <p>Total: ${orderDetails.totalAmount} ${orderDetails.currency}</p>
            <p>En breve recibirás tus entradas en un correo separado.</p>
        `;

        let status = 'SENT', failReason = null;
        let emailId = `email_${Date.now()}`;
        
        try {
            await emailService.send(userEmail, subject, htmlContent);
            console.log(`Correo de confirmación de compra enviado a ${userEmail}`);
            
            // *** WebSocket: Notificar entrega exitosa de email ***
            websocketService.notifyEmailDeliveryStatus(eventData.userId, {
                emailId,
                recipient: userEmail,
                status: 'sent',
                subject,
                sentAt: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`Error al enviar correo de confirmación a ${userEmail}:`, error);
            status = 'FAILED';
            failReason = error.message;
            
            // *** WebSocket: Notificar fallo de email ***
            websocketService.notifyEmailDeliveryStatus(eventData.userId, {
                emailId,
                recipient: userEmail,
                status: 'failed',
                subject,
                error: error.message,
                sentAt: new Date().toISOString()
            });
        }

        await NotificationLog.create({
            channel: 'EMAIL',
            recipient: userEmail,
            template: 'PURCHASE_CONFIRMATION',
            status,
            content: { subject, orderId: orderDetails.id, emailId },
            failReason
        });

        // *** WebSocket: Enviar push notification de confirmación ***
        if (eventData.userId && websocketService.isUserConnected(eventData.userId)) {
            websocketService.sendPushNotification(eventData.userId, {
                type: 'success',
                title: '¡Compra exitosa!',
                message: `Tu pedido #${orderDetails.codigoPedido} ha sido confirmado`,
                data: {
                    orderId: orderDetails.id,
                    amount: orderDetails.totalAmount,
                    currency: orderDetails.currency
                },
                priority: 'high'
            });
        }
    }

    // *** Nuevo método para notificaciones push generales ***
    async sendPushNotification(userId, notificationData) {
        const success = websocketService.sendPushNotification(userId, notificationData);
        
        // Log en base de datos
        await NotificationLog.create({
            channel: 'PUSH',
            recipient: userId.toString(),
            template: notificationData.type.toUpperCase(),
            status: success ? 'SENT' : 'FAILED',
            content: notificationData,
            failReason: success ? null : 'User not connected'
        });

        return success;
    }

    // *** Método para notificar cambios de evento ***
    async notifyEventUpdate(eventId, updateData, subscribedUsers = []) {
        // Enviar via WebSocket a usuarios conectados
        websocketService.notifyEventUpdate(eventId, updateData);

        // Log de la notificación
        await NotificationLog.create({
            channel: 'PUSH',
            recipient: `event_${eventId}`,
            template: 'EVENT_UPDATE',
            status: 'SENT',
            content: {
                eventId,
                updateType: updateData.updateType,
                message: updateData.message,
                subscribedUsersCount: subscribedUsers.length
            }
        });
    }
}

module.exports = new NotificationService();