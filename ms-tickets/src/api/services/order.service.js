// src/api/services/order.service.js
const { sequelize, Cart, CartItem, Order, OrderItem, TicketType } = require('../models');
const { NotFoundError, ConflictError, BadRequestError } = require('../../utils/errors');
const cartService = require('./cart.service'); // Reutilizamos el servicio de carrito
const ticketService = require('./ticket.service');
const publisherService = require('./publisher.service');

// Simulación de un servicio de pasarela de pago
const paymentGatewayService = {
    processPayment: async (paymentMethodId, amount) => {
        // En un sistema real, aquí se haría una llamada a Stripe, PayPal, etc.
        console.log(`Procesando pago por ${amount} con método ${paymentMethodId}`);
        if (paymentMethodId.startsWith('fail')) {
            return { success: false, transactionId: null, message: 'Pago rechazado por la pasarela.' };
        }
        return { success: true, transactionId: `pi_${Date.now()}`, message: 'Pago exitoso.' };
    }
};

class OrderService {

    async createOrderFromCart(userId, paymentDetails) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Obtener el carrito del usuario y validar que no esté vacío o expirado
            const cart = await Cart.findOne({
                where: { userId },
                include: [{ model: CartItem, as: 'items', include: [{ model: TicketType, as: 'ticketType' }] }],
                transaction
            });

            if (!cart || cart.items.length === 0 || new Date(cart.expiresAt) < new Date()) {
                throw new BadRequestError('El carrito está vacío o la reserva ha expirado.');
            }

            // 2. Verificar stock por última vez (race condition) y calcular total
            let totalAmount = 0;
            for (const item of cart.items) {
                const ticketType = item.ticketType;
                if (item.quantity > ticketType.quantity - ticketType.sold) {
                    throw new ConflictError(`No hay suficientes entradas para "${ticketType.name}".`);
                }
                totalAmount += item.quantity * item.priceAtReservation;
            }
            totalAmount = parseFloat(totalAmount.toFixed(2));

            // 3. Procesar el pago
            const paymentResult = await paymentGatewayService.processPayment(
                paymentDetails.paymentMethodId,
                totalAmount
            );

            if (!paymentResult.success) {
                throw new BadRequestError(`Error de pago: ${paymentResult.message}`); // En API real sería 402 Payment Required
            }

            // 4. Crear el pedido
            const order = await Order.create({
                userId,
                totalAmount,
                currency: 'USD',
                status: 'COMPLETED',
                paymentGatewayId: paymentResult.transactionId,
                billingAddress: paymentDetails.billingAddress
            }, { transaction });

            // 5. Mover ítems del carrito a ítems del pedido, actualizar stock y GENERAR ENTRADAS
            for (const item of cart.items) {
                const orderItem = await OrderItem.create({
                    orderId: order.id,
                    ticketTypeId: item.ticketTypeId,
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtReservation,
                }, { transaction });

                // Actualizar la cantidad vendida del tipo de ticket
                await TicketType.increment('sold', {
                    by: item.quantity,
                    where: { id: item.ticketTypeId },
                    transaction
                });

                // *** NUEVO: Generar las entradas para este OrderItem ***
                await ticketService.generateTicketsForOrderItem(orderItem, transaction);
            }

            // 6. Vaciar el carrito
            await CartItem.destroy({ where: { cartId: cart.id }, transaction });

            // Si todo fue exitoso, confirmar la transacción
            await transaction.commit();

            // En un sistema real, aquí se emitiría un evento para el microservicio de tickets/notificaciones
            // para generar los tickets QR y enviarlos al usuario.
            const eventPayload = {
                userEmail: user.email,
                userName: paymentDetails.billingAddress.nombreCompleto,
                orderDetails: {
                    id: order.id,
                    codigoPedido: order.orderCode,
                    totalAmount: parseFloat(order.totalAmount),
                    currency: order.currency
                }
            };
            await publisherService.publishMessage('purchase.completed', eventPayload);

            return {
                id: order.id,
                codigoPedido: order.orderCode,
                estado: order.status,
                total: order.totalAmount,
                mensaje: '¡Gracias por tu compra! Tus entradas han sido generadas.'
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findUserOrders(userId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const { count, rows } = await Order.findAndCountAll({
            where: { userId },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'orderCode', 'totalAmount', 'status', 'createdAt'],
        });

        return {
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                pageSize: limit
            },
            data: rows
        };
    }

    async findOrderById(userId, orderId) {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: TicketType, as: 'ticketType', attributes: ['name'] }]
            }]
        });

        if (!order) {
            throw new NotFoundError('Pedido no encontrado.');
        }
        return order;
    }

    async requestRefund(userId, orderId, refundDetails = {}) {
        const order = await this.findOrderById(userId, orderId);
        
        // Verificar que el pedido sea elegible para reembolso
        if (order.status !== 'COMPLETED') {
            throw new ConflictError('Solo se pueden reembolsar pedidos completados.');
        }
        
        // En un sistema real, aquí se verificaría la política de reembolso del evento
        // Por ejemplo, si el evento es en menos de 24 horas, no se permite reembolso
        
        // Crear solicitud de reembolso (simplificado)
        const refundRequest = {
            solicitudReembolsoId: `refund_req_${Date.now()}`,
            orderId: order.id,
            estado: 'PENDIENTE_REVISION',
            motivo: refundDetails.motivo || 'Sin motivo especificado',
            ticketIds: refundDetails.ticketIds || [], // Para reembolsos parciales
            createdAt: new Date()
        };
        
        // En un sistema real, esto se guardaría en una tabla de solicitudes de reembolso
        console.log('Solicitud de reembolso creada:', refundRequest);
        
        return {
            solicitudReembolsoId: refundRequest.solicitudReembolsoId,
            estado: refundRequest.estado,
            mensaje: 'Tu solicitud de reembolso ha sido recibida y será procesada.'
        };
    }
}

module.exports = new OrderService();