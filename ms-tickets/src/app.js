const express = require('express');
const config = require('./config');

const app = express();

// Aplicar configuraciones
config.express(app);
config.cors(app);

// Rutas principales
app.get('/status', (req, res) => {
    res.json({
        message: 'Microservicio funcionando correctamente TICKETS',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rutas de la API
const apiRoutes = require('./api/routes');
app.use('/api/v1', apiRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        timestamp: new Date().toISOString()
    });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        error: true,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;