// api/services/publisher.service.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const EVENTS_EXCHANGE = 'events_exchange';

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
            await this.channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
            console.log('✅ Publicador de eventos conectado a RabbitMQ y exchange asegurado.');
        } catch (error) {
            console.error('❌ Error al conectar el publicador a RabbitMQ. Reintentando en 10 segundos...', error.message);
            setTimeout(() => this.start(), 10000);
        }
    }

    async publishEventCreated(eventData) {
        await this.publishMessage('event.created', eventData);
    }

    async publishEventUpdated(eventData) {
        await this.publishMessage('event.updated', eventData);
    }

    async publishEventDeleted(eventId) {
        await this.publishMessage('event.deleted', { id: eventId });
    }

    async publishCategoryCreated(categoryData) {
        await this.publishMessage('category.created', categoryData);
    }

    async publishCategoryUpdated(categoryData) {
        await this.publishMessage('category.updated', categoryData);
    }

    async publishCategoryDeleted(categoryId) {
        await this.publishMessage('category.deleted', { id: categoryId });
    }

    async publishVenueCreated(venueData) {
        await this.publishMessage('venue.created', venueData);
    }

    async publishVenueUpdated(venueData) {
        await this.publishMessage('venue.updated', venueData);
    }

    async publishVenueDeleted(venueId) {
        await this.publishMessage('venue.deleted', { id: venueId });
    }

    async publishMessage(routingKey, message) {
        if (!this.channel) {
            console.error('☠️ El canal de RabbitMQ no está disponible. No se puede publicar el mensaje.');
            return;
        }

        try {
            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.publish(EVENTS_EXCHANGE, routingKey, messageBuffer, {
                persistent: true // Hace que el mensaje sobreviva a reinicios del broker
            });
            console.log(`🚀 Evento publicado: [${routingKey}] para entidad ID ${message.id || 'N/A'}`);
        } catch (error) {
            console.error('❌ Error al publicar mensaje:', error);
        }
    }

    async stop() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        console.log('🔌 Conexión del publicador de eventos cerrada.');
    }
}

module.exports = new PublisherService();