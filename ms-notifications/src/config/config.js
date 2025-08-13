require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,

    // Configuración de la base de datos (ya la tienes en database.js, pero es bueno centralizar)
    databaseUrl: process.env.DATABASE_URL,

    // Configuración de RabbitMQ
    rabbitmqUrl: process.env.RABBITMQ_URL,

    // Configuración de SMTP (NUEVO)
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // `secure:true` para 465, `false` para otros
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },
    emailFrom: process.env.EMAIL_FROM,
};

module.exports = config;