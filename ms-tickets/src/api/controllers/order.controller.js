// src/api/controllers/order.controller.js
const orderService = require('../services/order.service');

class OrderController {
    async create(req, res, next) {
        try {
            const userId = req.user.sub; // Usar 'sub' del JWT decodificado
            const orderDetails = await orderService.createOrderFromCart(userId, req.body);
            res.status(201).json(orderDetails);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const userId = req.user.sub; // Usar 'sub' del JWT decodificado
            const { page, limit } = req.query;
            const orders = await orderService.findUserOrders(userId, { page, limit });
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const userId = req.user.sub; // Usar 'sub' del JWT decodificado
            const { id } = req.params;
            const order = await orderService.findOrderById(userId, id);
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    }

    async requestRefund(req, res, next) {
        try {
            const userId = req.user.sub; // Usar 'sub' del JWT decodificado
            const { id } = req.params;
            const refundResult = await orderService.requestRefund(userId, id, req.body);
            res.status(202).json(refundResult);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();