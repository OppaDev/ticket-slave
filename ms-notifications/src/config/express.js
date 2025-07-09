const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

module.exports = (app) => {
    // Seguridad
    app.use(helmet());

    // Compresión
    app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('combined'));
    }

    // Rate limiting
    const limiter = rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        message: {
            error: 'Demasiadas peticiones',
            message: 'Has superado el límite de peticiones. Intenta de nuevo más tarde.'
        }
    });
    app.use(limiter);

    // Parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Configuración adicional
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
};