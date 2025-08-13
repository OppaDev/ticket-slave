// src/api/services/consumer.service.js
const amqp = require('amqplib');
const EventReplica = require('../models/eventReplica.model');
const CategoryReplica = require('../models/categoryReplica.model');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
const EVENTS_EXCHANGE = 'events_exchange';
const QUEUE_NAME = 'tickets_events_sync';

class ConsumerService {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async start() {
        try {
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            // Asegurar exchange y queue
            await this.channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
            await this.channel.assertQueue(QUEUE_NAME, { durable: true });
            
            // Bind routing keys que nos interesan
            const routingKeys = [
                'event.created',
                'event.updated', 
                'event.deleted',
                'category.created',
                'category.updated',
                'category.deleted'
            ];
            
            for (const key of routingKeys) {
                await this.channel.bindQueue(QUEUE_NAME, EVENTS_EXCHANGE, key);
            }
            
            // Configurar consumer
            this.channel.prefetch(1); // Procesar un mensaje a la vez
            await this.channel.consume(QUEUE_NAME, this.handleMessage.bind(this), { noAck: false });
            
            console.log('✅ Consumer de eventos iniciado, esperando mensajes...');
        } catch (error) {
            console.error('❌ Error al iniciar consumer:', error);
            setTimeout(() => this.start(), 10000); // Reintentar en 10s
        }
    }

    async handleMessage(msg) {
        if (!msg) return;
        
        try {
            const routingKey = msg.fields.routingKey;
            const content = JSON.parse(msg.content.toString());
            
            console.log(`📨 Procesando evento: ${routingKey}`, content);
            
            switch (routingKey) {
                case 'event.created':
                case 'event.updated':
                    await this.syncEvent(content);
                    break;
                case 'event.deleted':
                    await this.deleteEvent(content.id);
                    break;
                case 'category.created':
                case 'category.updated':
                    await this.syncCategory(content);
                    break;
                case 'category.deleted':
                    await this.deleteCategory(content.id);
                    break;
                default:
                    console.warn(`⚠️ Routing key no manejado: ${routingKey}`);
            }
            
            // Acknowledge message
            this.channel.ack(msg);
            console.log(`✅ Evento ${routingKey} procesado exitosamente`);
            
        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            // Nack sin requeue para enviar a DLQ o manejar errores
            this.channel.nack(msg, false, false);
        }
    }

    async syncEvent(eventData) {
        const [event, created] = await EventReplica.upsert({
            id: eventData.id,
            nombre: eventData.nombre,
            descripcion: eventData.descripcion,
            fechaInicio: eventData.fechaInicio,
            fechaFin: eventData.fechaFin,
            status: eventData.status,
            categoryId: eventData.categoryId,
            venueId: eventData.venueId,
            organizerId: eventData.organizerId,
            lastSyncAt: new Date()
        });
        
        console.log(`${created ? '➕' : '🔄'} Evento ${eventData.id} sincronizado`);
    }

    async deleteEvent(eventId) {
        const deleted = await EventReplica.destroy({ where: { id: eventId } });
        if (deleted) {
            console.log(`🗑️ Evento ${eventId} eliminado de réplica`);
        }
    }

    async syncCategory(categoryData) {
        const [category, created] = await CategoryReplica.upsert({
            id: categoryData.id,
            nombre: categoryData.nombre,
            descripcion: categoryData.descripcion,
            lastSyncAt: new Date()
        });
        
        console.log(`${created ? '➕' : '🔄'} Categoría ${categoryData.id} sincronizada`);
    }

    async deleteCategory(categoryId) {
        const deleted = await CategoryReplica.destroy({ where: { id: categoryId } });
        if (deleted) {
            console.log(`🗑️ Categoría ${categoryId} eliminada de réplica`);
        }
    }

    async stop() {
        if (this.channel) await this.channel.close();
        if (this.connection) await this.connection.close();
        console.log('🔌 Consumer de eventos detenido');
    }
}

module.exports = new ConsumerService();