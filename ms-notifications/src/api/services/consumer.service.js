// src/api/services/consumer.service.js
const amqp = require('amqplib');
const notificationService = require('./notification.service');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EXCHANGE_TICKETS = 'tickets_exchange';
const QUEUE_NOTIFICATIONS = 'notifications_queue';
const ROUTING_KEY_PURCHASE = 'purchase.completed';

class ConsumerService {
    constructor() {
        this.channel = null;
    }

    async start() {
        if (!RABBITMQ_URL) {
            console.error("❌ La variable RABBITMQ_URL no está definida. El consumidor no se iniciará.");
            return;
        }
        
        try {
            const connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await connection.createChannel();
            console.log('✅ Conectado a RabbitMQ');

            await this.channel.assertExchange(EXCHANGE_TICKETS, 'topic', { durable: true });
            await this.channel.assertQueue(QUEUE_NOTIFICATIONS, { durable: true });
            await this.channel.bindQueue(QUEUE_NOTIFICATIONS, EXCHANGE_TICKETS, ROUTING_KEY_PURCHASE);

            console.log('👂 Esperando mensajes en la cola:', QUEUE_NOTIFICATIONS);
            this.channel.consume(QUEUE_NOTIFICATIONS, (msg) => this.handleMessage(msg), { noAck: false });

        } catch (error) {
            console.error('❌ Error al conectar/configurar RabbitMQ. Reintentando en 5 segundos...', error);
            setTimeout(() => this.start(), 5000);
        }
    }

    handleMessage(msg) {
        if (msg.content) {
            const messageContent = msg.content.toString();
            const routingKey = msg.fields.routingKey;
            console.log(`\n📬 Mensaje recibido! Routing Key: [${routingKey}]`);

            try {
                const data = JSON.parse(messageContent);
                
                if (routingKey === ROUTING_KEY_PURCHASE) {
                    notificationService.handlePurchaseCompleted(data);
                } else {
                    console.warn(`No hay un manejador para la routing key: ${routingKey}`);
                }
                
                this.channel.ack(msg);
            } catch (error) {
                console.error("Error al procesar el mensaje:", error);
                this.channel.nack(msg, false, false); // No re-encolar para evitar bucles
            }
        }
    }
}

module.exports = new ConsumerService();