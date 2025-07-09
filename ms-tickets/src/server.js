require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./api/models');
const publisherService = require('./api/services/publisher.service');

const PORT = process.env.PORT || 3000;

// Función para inicializar el servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente');

        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('📊 Modelos sincronizados con la base de datos');
        }

        // Iniciar servidor
        await publisherService.start();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📱 Entorno: ${process.env.NODE_ENV}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
        });

        // Manejo de cierre graceful
        process.on('SIGTERM', async () => {
            console.log('🔄 Cerrando servidor...');
            await sequelize.close();
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;