// src/api/routes/ticketType.routes.js
const express = require('express');
const ticketTypeController = require('../controllers/ticketType.controller');
const { createTicketTypeDTO, updateTicketTypeDTO } = require('../dtos/ticketType.dto');
const { handleValidationErrors } = require('../middleware/validation.middleware');

// mergeParams es crucial para acceder a :eventId
const router = express.Router({ mergeParams: true }); 

// GET /api/v1/events/:eventId/ticket-types
router.get('/', ticketTypeController.getAll);

// POST /api/v1/events/:eventId/ticket-types
router.post(
    '/',
    createTicketTypeDTO,
    handleValidationErrors,
    ticketTypeController.create
);

// GET /api/v1/events/:eventId/ticket-types/:typeId
router.get('/:typeId', ticketTypeController.getOne);

// PUT /api/v1/events/:eventId/ticket-types/:typeId
router.put(
    '/:typeId',
    updateTicketTypeDTO,
    handleValidationErrors,
    ticketTypeController.update
);

// DELETE /api/v1/events/:eventId/ticket-types/:typeId
router.delete('/:typeId', ticketTypeController.delete);

module.exports = router;