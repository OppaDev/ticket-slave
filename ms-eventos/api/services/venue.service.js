// api/services/venue.service.js (versión limpia)
const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');

class VenueService {
  constructor() {
    this.model = sequelize.models.Venue;
  }

  async create(data, organizerId) {
    const newVenue = await this.model.create({
      ...data,
      organizerId,
    });
    return newVenue;
  }

  async find() {
    // Para la lista general, no es necesario incluir las zonas
    const venues = await this.model.findAll();
    return venues;
  }

  async findOne(id) {
    const venue = await this.model.findByPk(id, {
      include: ['zones'], // Al pedir un recinto, sí queremos ver sus zonas
    });
    if (!venue) {
      throw boom.notFound('Venue not found');
    }
    return venue;
  }

  async update(id, changes) {
    // En el update, no necesitamos buscar el venue con sus zonas, así que podemos optimizarlo
    const venue = await this.model.findByPk(id);
     if (!venue) {
      throw boom.notFound('Venue not found');
    }
    const updatedVenue = await venue.update(changes);
    return updatedVenue;
  }

  async delete(id) {
    const venue = await this.model.findByPk(id);
     if (!venue) {
      throw boom.notFound('Venue not found');
    }
    await venue.destroy();
    return { id };
  }
}

module.exports = VenueService;
