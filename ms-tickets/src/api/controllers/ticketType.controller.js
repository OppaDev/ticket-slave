// src/api/controllers/ticketType.controller.js
const ticketTypeService = require('../services/ticketType.service');

class TicketTypeController {
    async create(req, res, next) {
        try {
            const { eventId } = req.params;
            const ticketType = await ticketTypeService.create(eventId, req.body);
            res.status(201).json(ticketType);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { eventId } = req.params;
            const ticketTypes = await ticketTypeService.findByEventId(eventId);
            res.status(200).json(ticketTypes);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const { eventId, typeId } = req.params;
            const ticketType = await ticketTypeService.findById(eventId, typeId);
            res.status(200).json(ticketType);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { eventId, typeId } = req.params;
            const updatedTicketType = await ticketTypeService.update(eventId, typeId, req.body);
            res.status(200).json(updatedTicketType);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { eventId, typeId } = req.params;
            await ticketTypeService.delete(eventId, typeId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TicketTypeController();