// src/api/middleware/validation.middleware.js

const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación de express-validator
 * Debe ser usado después de los validadores en las rutas
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: formattedErrors
        });
    }
    
    next();
};

/**
 * Middleware para sanitizar datos de entrada
 * Remueve espacios en blanco y convierte a tipos apropiados
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        // Sanitizar strings
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
                // Convertir strings vacíos a null
                if (req.body[key] === '') {
                    req.body[key] = null;
                }
            }
        });
        
        // Sanitizar números
        ['eventId', 'userId', 'orderId', 'ticketTypeId', 'quantity', 'id'].forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                const num = parseInt(req.body[field], 10);
                if (!isNaN(num)) {
                    req.body[field] = num;
                }
            }
        });
        
        // Sanitizar decimales
        ['price', 'priceAtPurchase', 'totalAmount'].forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                const num = parseFloat(req.body[field]);
                if (!isNaN(num)) {
                    req.body[field] = num;
                }
            }
        });
    }
    
    next();
};

module.exports = {
    handleValidationErrors,
    sanitizeInput
};
