// src/api/routes/cart.routes.js
const express = require('express');
const cartController = require('../controllers/cart.controller');
const { addItemToCartDTO } = require('../dtos/cart.dto');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

// GET /api/v1/cart
router.get('/', cartController.get);

// DELETE /api/v1/cart
router.delete('/', cartController.clear);

// POST /api/v1/cart/items
router.post(
    '/items',
    addItemToCartDTO,
    handleValidationErrors,
    cartController.addItem
);

// DELETE /api/v1/cart/items/:itemId
router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;