// src/api/routes/order.routes.js
const express = require('express');
const orderController = require('../controllers/order.controller');
const { createOrderDTO } = require('../dtos/order.dto');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// POST /api/v1/orders
router.post(
  '/',
  createOrderDTO,
  handleValidationErrors,
  orderController.create
);

// GET /api/v1/orders
router.get('/', orderController.getAll);

// GET /api/v1/orders/:id
router.get('/:id', orderController.getOne);

// POST /api/v1/orders/:id/refund
router.post('/:id/refund', orderController.requestRefund);

module.exports = router;