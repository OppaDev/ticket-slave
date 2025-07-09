// src/api/services/cart.service.js
const { sequelize, Cart, CartItem, TicketType } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError, BadRequestError } = require('../../utils/errors');

const CART_EXPIRATION_MINUTES = 15;

class CartService {

    /**
     * Obtiene o crea un carrito para un usuario. Si el carrito existente ha expirado,
     * se limpia y se reinicia su temporizador.
     */
    async getOrCreateCartForUser(userId) {
        let cart = await Cart.findOne({ where: { userId } });

        const now = new Date();
        const expirationTime = new Date(now.getTime() + CART_EXPIRATION_MINUTES * 60 * 1000);

        if (!cart) {
            return await Cart.create({ userId, expiresAt: expirationTime });
        }

        if (cart.expiresAt < now) {
            // El carrito ha expirado, lo vaciamos y reiniciamos
            await CartItem.destroy({ where: { cartId: cart.id } });
            cart.expiresAt = expirationTime;
            await cart.save();
        }

        return cart;
    }

    /**
     * Añade un ítem al carrito, verificando el stock disponible.
     */
    async addItem(userId, ticketTypeId, quantity) {
        const transaction = await sequelize.transaction();
        try {
            const cart = await this.getOrCreateCartForUser(userId);

            const ticketType = await TicketType.findByPk(ticketTypeId, { transaction });
            if (!ticketType) {
                throw new NotFoundError('El tipo de ticket no existe.');
            }

            if (quantity > ticketType.maxPerPurchase) {
                throw new BadRequestError(`No puedes comprar más de ${ticketType.maxPerPurchase} entradas de este tipo por transacción.`);
            }

            // Verificar stock: total - vendidos - reservados en otros carritos
            // Primero obtenemos los IDs de carritos que no han expirado
            const activeCartIds = await Cart.findAll({
                where: {
                    expiresAt: {
                        [Op.gt]: new Date()
                    }
                },
                attributes: ['id'],
                transaction
            });

            const activeCartIdValues = activeCartIds.map(cart => cart.id);

            // Luego calculamos la cantidad reservada para este tipo de ticket
            const reservedQuantity = await CartItem.sum('quantity', {
                where: {
                    ticketTypeId,
                    cartId: {
                        [Op.in]: activeCartIdValues.length > 0 ? activeCartIdValues : [0]
                    }
                },
                transaction
            }) || 0;

            const availableStock = ticketType.quantity - ticketType.sold - reservedQuantity;
            if (quantity > availableStock) {
                throw new ConflictError('No hay suficientes entradas disponibles para satisfacer la solicitud.');
            }

            let cartItem = await CartItem.findOne({ where: { cartId: cart.id, ticketTypeId } });
            if (cartItem) {
                cartItem.quantity += quantity;
                await cartItem.save({ transaction });
            } else {
                await CartItem.create({
                    cartId: cart.id,
                    ticketTypeId,
                    quantity,
                    priceAtReservation: ticketType.price
                }, { transaction });
            }

            await transaction.commit();
            return this.getCart(userId);
        } catch (error) {
            await transaction.rollback();
            throw error; // Re-lanza el error para que sea manejado por el controlador
        }
    }

    /**
     * Formatea y devuelve el contenido completo del carrito del usuario.
     */
    async getCart(userId) {
        const cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{ 
                    model: TicketType, 
                    as: 'ticketType',
                    attributes: ['id', 'name', 'eventId', 'price']
                }]
            }]
        });

        if (!cart || cart.expiresAt < new Date()) {
            return {
                id: cart ? cart.id : null,
                items: [],
                total: 0.00,
                moneda: 'USD',
                expiraEnSegundos: 0,
            };
        }

        let total = 0;
        const formattedItems = cart.items.map(item => {
            const subtotal = item.quantity * item.priceAtReservation;
            total += subtotal;
            return {
                itemId: item.id,
                evento: {
                    id: item.ticketType.eventId,
                    // En un sistema real, aquí se haría una llamada al microservicio de eventos
                    // para obtener el nombre del evento
                    nombre: `Evento ${item.ticketType.eventId}` 
                },
                tipoTicket: {
                    id: item.ticketType.id,
                    nombre: item.ticketType.name
                },
                cantidad: item.quantity,
                precioUnitario: parseFloat(item.priceAtReservation),
                subtotal: parseFloat(subtotal.toFixed(2)),
            };
        });

        const expiraEnSegundos = Math.max(0, Math.floor((new Date(cart.expiresAt) - new Date()) / 1000));

        return {
            id: cart.id,
            items: formattedItems,
            total: parseFloat(total.toFixed(2)),
            moneda: 'USD',
            expiraEnSegundos
        };
    }

    async removeItem(userId, itemId) {
        const cart = await this.getOrCreateCartForUser(userId);
        const result = await CartItem.destroy({ where: { id: itemId, cartId: cart.id } });
        if (result === 0) {
            throw new NotFoundError('El ítem no existe en el carrito.');
        }
    }

    async clearCart(userId) {
        const cart = await this.getOrCreateCartForUser(userId);
        await CartItem.destroy({ where: { cartId: cart.id } });
    }
}

module.exports = new CartService();