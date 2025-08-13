// src/api/services/publisher.service.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';
const EXCHANGE_TICKETS = 'tickets_exchange';

class PublisherService {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async start() {
        if (!RABBITMQ_URL) {
            console.error("❌ La variable RABBITMQ_URL no está definida. El publicador no se iniciará.");
            return;
        }

        try {
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(EXCHANGE_TICKETS, 'topic', { durable: true });
            console.log('✅ Publicador conectado a RabbitMQ y exchange asegurado.');
        } catch (error) {
            console.error('❌ Error al conectar el publicador a RabbitMQ. Reintentando en 10 segundos...', error.message);
            setTimeout(() => this.start(), 10000);
        }
    }

    async publishMessage(routingKey, message) {
        if (!this.channel) {
            console.error('☠️ El canal de RabbitMQ no está disponible. No se puede publicar el mensaje.');
            return;
        }

        try {
            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.publish(EXCHANGE_TICKETS, routingKey, messageBuffer, {
                persistent: true // Hace que el mensaje sobreviva a reinicios del broker
            });
            console.log(`🚀 Mensaje publicado en exchange [${EXCHANGE_TICKETS}] con routing key [${routingKey}]`);
        } catch (error) {
            console.error('❌ Error al publicar mensaje:', error);
        }
    }

    async stop() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        console.log('🔌 Conexión del publicador a RabbitMQ cerrada.');
    }
}

module.exports = new PublisherService();