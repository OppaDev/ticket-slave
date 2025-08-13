// src/api/services/ticketType.service.js
const { TicketType } = require('../models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const websocketService = require('./websocket.service');

class TicketTypeService {
    // Mapear campos de la API a la base de datos
    mapApiFieldsToDatabase(apiData) {
        return {
            name: apiData.nombre,
            description: apiData.descripcion,
            price: apiData.precio,
            currency: apiData.moneda || 'USD',
            quantity: apiData.cantidad,
            minPerPurchase: apiData.minPorCompra || 1,
            maxPerPurchase: apiData.maxPorCompra || 10,
            saleStartDate: apiData.fechaInicioVenta,
            saleEndDate: apiData.fechaFinVenta
        };
    }

    async create(eventId, data) {
        const mappedData = this.mapApiFieldsToDatabase(data);
        const ticketTypeData = { ...mappedData, eventId };
        const ticketType = await TicketType.create(ticketTypeData);
        
        // Devolver con el formato de la API
        return {
            id: ticketType.id,
            nombre: ticketType.name,
            precio: parseFloat(ticketType.price),
            cantidad: ticketType.quantity
        };
    }

    async findByEventId(eventId) {
        const ticketTypes = await TicketType.findAll({ where: { eventId } });
        
        // Mapear los campos para que coincidan con la especificación de la API
        return ticketTypes.map(ticketType => ({
            id: ticketType.id,
            nombre: ticketType.name,
            descripcion: ticketType.description,
            precio: parseFloat(ticketType.price),
            moneda: ticketType.currency,
            totalDisponibles: ticketType.quantity,
            vendidos: ticketType.sold,
            disponibles: ticketType.quantity - ticketType.sold,
            enVentaDesde: ticketType.saleStartDate,
            enVentaHasta: ticketType.saleEndDate,
            minPorCompra: ticketType.minPerPurchase,
            maxPorCompra: ticketType.maxPerPurchase
        }));
    }

    async findById(eventId, typeId) {
        const ticketType = await TicketType.findOne({ where: { id: typeId, eventId } });
        if (!ticketType) {
            throw new NotFoundError(`El tipo de ticket con ID ${typeId} no fue encontrado para el evento ${eventId}.`);
        }
        return ticketType;
    }

    async update(eventId, typeId, data) {
        const ticketType = await this.findById(eventId, typeId);
        const mappedData = this.mapApiFieldsToDatabase(data);

        // Lógica de negocio: No se puede reducir la cantidad total por debajo de la cantidad ya vendida.
        if (mappedData.quantity && mappedData.quantity < ticketType.sold) {
            throw new ConflictError(`No se puede establecer la cantidad a ${mappedData.quantity} porque ya se han vendido ${ticketType.sold} tickets.`);
        }

        await ticketType.update(mappedData);
        return ticketType;
    }

    async delete(eventId, typeId) {
        const ticketType = await this.findById(eventId, typeId);

        // Lógica de negocio: No se puede eliminar un tipo de ticket si ya se han vendido entradas.
        if (ticketType.sold > 0) {
            throw new ConflictError(`No se puede eliminar este tipo de ticket porque ya se han vendido ${ticketType.sold} entradas.`);
        }

        await ticketType.destroy();
    }

    // Método auxiliar para notificar cambios de stock vía WebSocket
    notifyStockChange(ticketType) {
        const stockData = {
            available: ticketType.quantity - ticketType.sold,
            total: ticketType.quantity,
            sold: ticketType.sold
        };

        // Notificar cambio de stock
        websocketService.notifyStockUpdate(
            ticketType.eventId,
            ticketType.id,
            stockData
        );

        // Alertar si stock está bajo (menos de 10)
        if (stockData.available <= 10 && stockData.available > 0) {
            websocketService.notifyLowStock(
                ticketType.eventId,
                ticketType.id,
                { ...stockData, threshold: 10 }
            );
        }
    }

    // Método para obtener stock en tiempo real
    async getStockStatus(eventId, typeId) {
        const ticketType = await this.findById(eventId, typeId);
        return {
            ticketTypeId: ticketType.id,
            eventId: ticketType.eventId,
            available: ticketType.quantity - ticketType.sold,
            total: ticketType.quantity,
            sold: ticketType.sold,
            percentage: ((ticketType.sold / ticketType.quantity) * 100).toFixed(1)
        };
    }
}

module.exports = new TicketTypeService();