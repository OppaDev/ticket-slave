// src/api/controllers/ticket.controller.js
const ticketService = require('../services/ticket.service');

class TicketController {
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { eventId, status } = req.query;
      const tickets = await ticketService.findUserTickets(userId, { eventId, status });
      res.status(200).json({ data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const ticket = await ticketService.findTicketById(userId, id);
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      // Nota: El check-in debería requerir un permiso especial (ej. 'ticket:validate')
      // que no estamos implementando en el auth.middleware simulado.
      const { qrCodeData } = req.body;
      const result = await ticketService.checkIn(qrCodeData);

      const response = {
        estado: result.status,
        mensaje: result.message,
        checkInTimestamp: result.ticket.checkInTimestamp,
        datosEntrada: {
            titular: result.ticket.ownerName,
            // Podríamos incluir más datos si los tuviéramos
        }
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();