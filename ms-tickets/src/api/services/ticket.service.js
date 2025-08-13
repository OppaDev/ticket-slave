// src/api/services/ticket.service.js
const { Ticket, OrderItem, TicketType } = require('../models');
const { NotFoundError, ConflictError, AppError } = require('../../utils/errors');
const crypto = require('crypto'); // Para firmar el QR
const websocketService = require('./websocket.service');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-jwt-secret-super-secreto';

class TicketService {

    /**
     * Genera las entradas para un ítem de pedido específico.
     * Esta función es llamada internamente por el OrderService.
     */
    async generateTicketsForOrderItem(orderItem, transaction) {
        const tickets = [];
        const ticketType = await orderItem.getTicketType({ transaction });
        const order = await orderItem.getOrder({ transaction });

        for (let i = 0; i < orderItem.quantity; i++) {
            const ticketIdSeed = `${order.id}-${orderItem.id}-${i}`;
            const ticketCode = `TKT-E${ticketType.eventId}-T${orderItem.id}-${i + 1}`;

            const qrPayload = {
                ticketCode: ticketCode,
                eventId: ticketType.eventId,
                userId: order.userId,
            };

            // Firmamos el payload para evitar falsificaciones
            const signature = crypto.createHmac('sha256', JWT_SECRET).update(JSON.stringify(qrPayload)).digest('hex');
            qrPayload.sig = signature;

            const ticketData = {
                ticketCode,
                orderItemId: orderItem.id,
                userId: order.userId,
                eventId: ticketType.eventId,
                status: 'VALID',
                qrCodeData: JSON.stringify(qrPayload),
                ownerName: order.billingAddress.nombreCompleto
            };

            const newTicket = await Ticket.create(ticketData, { transaction });
            tickets.push(newTicket);
        }
        return tickets;
    }

    async findUserTickets(userId, filters = {}) {
        const whereClause = { userId };
        if (filters.eventId) whereClause.eventId = filters.eventId;
        if (filters.status) whereClause.status = filters.status;

        return await Ticket.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
    }

    async findTicketById(userId, ticketId) {
        const ticket = await Ticket.findOne({ where: { id: ticketId, userId } });
        if (!ticket) {
            throw new NotFoundError('Entrada no encontrada o no pertenece al usuario.');
        }
        return ticket;
    }

    /**
     * Valida una entrada en el punto de acceso (check-in).
     */
    async checkIn(qrCodeData) {
        let payload;
        try {
            payload = JSON.parse(qrCodeData);
        } catch (e) {
            throw new AppError('Formato de QR inválido.', 400);
        }

        const { sig, ...dataToVerify } = payload;
        if (!sig) {
            throw new AppError('Firma del QR ausente.', 400);
        }

        const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(JSON.stringify(dataToVerify)).digest('hex');

        if (sig !== expectedSignature) {
            throw new AppError('Firma del QR inválida. Posible falsificación.', 400);
        }

        const ticket = await Ticket.findOne({ where: { ticketCode: payload.ticketCode } });
        if (!ticket) {
            throw new NotFoundError('La entrada no existe en el sistema.');
        }

        if (ticket.status === 'USED') {
            return { status: 'VALIDADO', message: 'Acceso permitido (previamente validado).', ticket };
        }
        if (ticket.status === 'CANCELLED') {
            throw new AppError('La entrada ha sido cancelada o reembolsada.', 410); // 410 Gone
        }

        ticket.status = 'USED';
        ticket.checkInTimestamp = new Date();
        await ticket.save();

        // *** WebSocket: Notificar validación de ticket ***
        websocketService.notifyTicketValidated(ticket.eventId, {
            ticketCode: ticket.ticketCode,
            userId: ticket.userId,
            timestamp: ticket.checkInTimestamp,
            status: 'valid',
            message: 'Ticket validado correctamente'
        });

        return { status: 'VALIDADO', message: 'Acceso permitido.', ticket };
    }
}

module.exports = new TicketService();