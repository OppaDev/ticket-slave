// src/api/dtos/ticketType.dto.js
const { body } = require('express-validator');

const createTicketTypeDTO = [
    // Campos según la especificación de la API
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido.')
        .isString().withMessage('El nombre debe ser una cadena de texto.')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),

    body('descripcion')
        .optional()
        .trim()
        .isString().withMessage('La descripción debe ser una cadena de texto.'),

    body('precio')
        .notEmpty().withMessage('El precio es requerido.')
        .isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo.'),

    body('moneda')
        .optional()
        .isString().withMessage('La moneda debe ser una cadena de texto.')
        .isLength({ min: 3, max: 3 }).withMessage('La moneda debe ser un código de 3 letras (ej. USD).'),

    body('cantidad')
        .notEmpty().withMessage('La cantidad es requerida.')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor que 0.'),

    body('minPorCompra')
        .optional()
        .isInt({ min: 1 }).withMessage('El mínimo por compra debe ser al menos 1.'),

    body('maxPorCompra')
        .optional()
        .isInt({ min: 1 }).withMessage('El máximo por compra debe ser al menos 1.'),

    body('fechaInicioVenta')
        .notEmpty().withMessage('La fecha de inicio de venta es requerida.')
        .isISO8601().withMessage('La fecha de inicio de venta debe tener formato ISO8601.'),

    body('fechaFinVenta')
        .notEmpty().withMessage('La fecha de fin de venta es requerida.')
        .isISO8601().withMessage('La fecha de fin de venta debe tener formato ISO8601.')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.fechaInicioVenta)) {
                throw new Error('La fecha de fin de venta debe ser posterior a la fecha de inicio.');
            }
            return true;
        }),
];

const updateTicketTypeDTO = [
    body('nombre').optional().trim().isString().isLength({ min: 3, max: 100 }),
    body('descripcion').optional().trim().isString(),
    body('precio').optional().isFloat({ gt: 0 }),
    body('cantidad').optional().isInt({ min: 1 }),
];

module.exports = {
    createTicketTypeDTO,
    updateTicketTypeDTO,
};