// src/api/controllers/cart.controller.js
const cartService = require('../services/cart.service');

class CartController {
    async get(req, res, next) {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCart(userId);
            res.status(200).json(cart);
        } catch (error) {
            next(error);
        }
    }

    async addItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { ticketTypeId, cantidad } = req.body;
            
            // Mapeo del DTO: cantidad (español) -> quantity (inglés)
            const quantity = cantidad;
            
            const updatedCart = await cartService.addItem(userId, ticketTypeId, quantity);
            res.status(200).json({
                ...updatedCart,
                mensaje: `${quantity} entrada(s) añadidas al carrito.`
            });
        } catch (error) {
            next(error);
        }
    }

    async removeItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            await cartService.removeItem(userId, parseInt(itemId));
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async clear(req, res, next) {
        try {
            const userId = req.user.id;
            await cartService.clearCart(userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();