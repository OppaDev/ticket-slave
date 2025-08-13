// api/services/event.service.js
const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');
const publisherService = require('./publisher.service');

class EventService {
  constructor() {
    this.model = sequelize.models.Event;
  }

  async create(data, organizerId) {

    //validar existencia de categoria y venue
    const { categoryId, venueId } = data;

    const category = await sequelize.models.Category.findByPk(categoryId);
    if (!category) {
      throw boom.notFound('Category not found');
    }
    const venue = await sequelize.models.Venue.findByPk(venueId);
    if (!venue) {
      throw boom.notFound('Venue not found');
    }

    const newEvent = await this.model.create({
      ...data,
      organizerId: organizerId,
    });

    // Publicar evento de creación
    try {
      await publisherService.publishEventCreated({
        id: newEvent.id,
        nombre: newEvent.nombre,
        descripcion: newEvent.descripcion,
        fechaInicio: newEvent.fechaInicio,
        fechaFin: newEvent.fechaFin,
        status: newEvent.status,
        categoryId: newEvent.categoryId,
        venueId: newEvent.venueId,
        organizerId: newEvent.organizerId
      });
    } catch (error) {
      console.error('Error publicando evento event.created:', error);
    }

    return newEvent;
  }

  async find(query, user) {
    const options = {
      include: ['category', 'venue'],
      where: {},
    };

    // Lógica de Paginación
    const { limit, offset } = query;
    if (limit && offset) {
      options.limit = limit;
      options.offset = offset;
    }

    // Lógica de Filtros
    const { categoryId, venueId } = query;
    if (categoryId) {
      options.where.categoryId = categoryId;
    }
    if (venueId) {
      options.where.venueId = venueId;
    }

    // Lógica de Visibilidad
    if (user && (user.role === 'admin' || user.role === 'organizer')) {
      // Si es organizer, muestra solo sus eventos (de cualquier estado)

      if (user.role === 'organizer') {
        options.where.organizerId = user.sub;
      }
      // Si es admin, puede ver todos los eventos (no se añade filtro de organizerId)
    } else {
      // Para el público general (o sin token), solo eventos publicados
      options.where.status = 'PUBLICADO';
    }

    console.log('EventService.find options:', options);

    const events = this.model.findAll(options);
    return events;
  }

  async findOne(id) {
    const event = this.model.findByPk(id, {
      include: ['category', 'venue'],
    });
    if (!event) {
      throw boom.notFound('Event not found');
    }
    return event;
  }

  async update(id, changes, user) {
    const event = await this.findOne(id);

    // Verificación de propiedad
    if (event.organizerId !== user.sub && user.role !== 'admin') {
      throw boom.forbidden('You are not allowed to update this event');
    }
    const updatedEvent = await event.update(changes);

    // Publicar evento de actualización
    try {
      await publisherService.publishEventUpdated({
        id: updatedEvent.id,
        nombre: updatedEvent.nombre,
        descripcion: updatedEvent.descripcion,
        fechaInicio: updatedEvent.fechaInicio,
        fechaFin: updatedEvent.fechaFin,
        status: updatedEvent.status,
        categoryId: updatedEvent.categoryId,
        venueId: updatedEvent.venueId,
        organizerId: updatedEvent.organizerId
      });
    } catch (error) {
      console.error('Error publicando evento event.updated:', error);
    }

    return updatedEvent;
  }

  async delete(id, user) {
    const event = await this.findOne(id);
    if (event.organizerId !== user.sub && user.role !== 'admin') {
      throw boom.forbidden('You are not allowed to delete this event');
    }
    await event.destroy();

    // Publicar evento de eliminación
    try {
      await publisherService.publishEventDeleted(id);
    } catch (error) {
      console.error('Error publicando evento event.deleted:', error);
    }

    return { id };
  }

  async publish(id, user) {
    const event = await this.findOne(id);
    if (event.organizerId !== user.sub && user.role !== 'admin') {
      throw boom.forbidden('You are not allowed to publish this event');
    }

    if (event.status !== 'BORRADOR') {
      throw boom.conflict('Only events in DRAFT status can be published');
    }
    // Aquí irían más validaciones de negocio (ej: tiene recinto, categoría, etc.)

    const updatedEvent = await event.update({ status: 'PUBLICADO' });

    // Publicar evento de cambio de estado
    try {
      await publisherService.publishEventUpdated({
        id: updatedEvent.id,
        nombre: updatedEvent.nombre,
        descripcion: updatedEvent.descripcion,
        fechaInicio: updatedEvent.fechaInicio,
        fechaFin: updatedEvent.fechaFin,
        status: updatedEvent.status,
        categoryId: updatedEvent.categoryId,
        venueId: updatedEvent.venueId,
        organizerId: updatedEvent.organizerId
      });
    } catch (error) {
      console.error('Error publicando evento event.updated (publish):', error);
    }

    return updatedEvent;
  }
}

module.exports = EventService;
