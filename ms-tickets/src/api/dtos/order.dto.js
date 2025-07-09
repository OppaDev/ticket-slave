// src/api/dtos/order.dto.js
const { body } = require('express-validator');

const createOrderDTO = [
    body('paymentMethodId')
        .trim()
        .notEmpty().withMessage('El ID del método de pago (paymentMethodId) es requerido.')
        .isString().withMessage('El ID del método de pago (paymentMethodId) debe ser una cadena de texto.'),

    body('billingAddress')
        .notEmpty().withMessage('La dirección de facturación es requerida.')
        .isObject().withMessage('La dirección de facturación debe ser un objeto.'),

    body('billingAddress.nombreCompleto')
        .trim()
        .notEmpty().withMessage('El nombre completo es requerido en la dirección de facturación.'),

    body('billingAddress.identificacion')
        .trim()
        .notEmpty().withMessage('La identificación es requerida en la dirección de facturación.'),

    body('billingAddress.direccion')
        .trim()
        .notEmpty().withMessage('La dirección es requerida en la dirección de facturación.'),

    body('billingAddress.ciudad')
        .trim()
        .notEmpty().withMessage('La ciudad es requerida en la dirección de facturación.'),

    body('billingAddress.pais')
        .trim()
        .notEmpty().withMessage('El país es requerido en la dirección de facturación.'),
];

module.exports = {
    createOrderDTO,
};