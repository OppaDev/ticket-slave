// src/api/routes/ticket.routes.js
const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const { checkInDTO } = require('../dtos/ticket.dto');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// El check-in es una operación especial que no sigue el patrón de las otras
router.post(
  '/check-in',
  authenticate, // O un middleware de autenticación para personal del evento
  checkInDTO,
  handleValidationErrors,
  ticketController.checkIn
);

// Las siguientes rutas son para el usuario final y requieren autenticación
router.use(authenticate);

// GET /api/v1/tickets
router.get('/', ticketController.getAll);

// GET /api/v1/tickets/:id
router.get('/:id', ticketController.getOne);

module.exports = router;