const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

module.exports = (app) => {
    // Seguridad básica
    app.use(helmet());

    // Compresión de respuestas
    app.use(compression());

    // Logging de peticiones HTTP en desarrollo/producción
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('combined'));
    }

    // Parsing de JSON y URL-encoded bodies
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Configuración adicional
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
};