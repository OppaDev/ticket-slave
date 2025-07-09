const express = require('express');
const config = require('./config');

const app = express();

// Aplicar configuraciones
config.express(app);
config.cors(app);

// Rutas principales
app.get('/api/v1', (req, res) => {
    res.json({
        message: 'Microservicio de Notificaciones funcionando.',
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
        message: `La ruta ${req.originalUrl} no existe en este servicio.`
    });
});

// Middleware global de manejo de errores simplificado
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.stack);

    res.status(500).json({
        error: true,
        message: 'Ha ocurrido un error inesperado en el servidor.',
    });
});

module.exports = app;