// src/api/routes/index.js
const express = require('express');
const ticketTypeRoutes = require('./ticketType.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const ticketRoutes = require('./ticket.routes'); 


const router = express.Router();

// Rutas de Tipos de Ticket (anidadas bajo eventos)
router.use('/events/:eventId/ticket-types', ticketTypeRoutes);

// Rutas del Carrito
router.use('/cart', cartRoutes);

// Rutas de Pedidos
router.use('/orders', orderRoutes);

// Rutas de Entradas Individuales
router.use('/tickets', ticketRoutes);

module.exports = router;