require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./api/models');
const consumerService = require('./api/services/consumer.service');

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('📊 Modelos de logs de notificación sincronizados');
        }

        // Iniciar el consumidor de RabbitMQ
        await consumerService.start();

        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor de Notificaciones corriendo en puerto ${PORT}`);
            console.log(`📱 Entorno: ${process.env.NODE_ENV}`);
            console.log(`🌍 URL Health Check: http://localhost:${PORT}/health`);
        });

        // Manejo de cierre graceful
        const gracefulShutdown = async () => {
            console.log('🔄 Cerrando servicios...');
            await consumerService.stop(); 
            server.close(() => {
                console.log('✅ Servidor HTTP cerrado.');
                sequelize.close().then(() => {
                    console.log('🔌 Conexión a la base de datos cerrada.');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('❌ Error fatal al iniciar el servidor de notificaciones:', error);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;