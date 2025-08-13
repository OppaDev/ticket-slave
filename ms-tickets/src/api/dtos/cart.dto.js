// src/api/dtos/cart.dto.js
const { body } = require('express-validator');

const addItemToCartDTO = [
    body('ticketTypeId')
        .notEmpty().withMessage('El ticketTypeId es requerido.')
        .isString().withMessage('El ticketTypeId debe ser una cadena de texto.'),

    body('cantidad')
        .notEmpty().withMessage('La cantidad es requerida.')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo.'),
];

module.exports = {
    addItemToCartDTO,
};