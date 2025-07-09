// src/api/dtos/ticket.dto.js
const { body } = require('express-validator');

const checkInDTO = [
  body('qrCodeData')
    .trim()
    .notEmpty().withMessage('Los datos del código QR (qrCodeData) son requeridos.')
    .isJSON().withMessage('El formato del QR debe ser un JSON válido.'),
];

module.exports = {
  checkInDTO,
};