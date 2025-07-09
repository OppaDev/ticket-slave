// src/api/services/notification.service.js
const emailService = require('./email.service');
const { NotificationLog } = require('../models');

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
        try {
            await emailService.send(userEmail, subject, htmlContent);
            console.log(`Correo de confirmación de compra enviado a ${userEmail}`);
        } catch (error) {
            console.error(`Error al enviar correo de confirmación a ${userEmail}:`, error);
            status = 'FAILED';
            failReason = error.message;
        }

        await NotificationLog.create({
            channel: 'EMAIL',
            recipient: userEmail,
            template: 'PURCHASE_CONFIRMATION',
            status,
            content: { subject, orderId: orderDetails.id },
            failReason
        });
    }
}

module.exports = new NotificationService();