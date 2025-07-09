// api/services/zone.service.js
const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');
// Importamos VenueService para validar la existencia del recinto padre
const VenueService = require('./venue.service');
const venueService = new VenueService();

class ZoneService {
  constructor() {
    this.model = sequelize.models.Zone;
  }

  async findByVenue(venueId) {
    // Primero, validamos que el recinto exista. Si no, venueService lanzará un 404.
    await venueService.findOne(venueId);
    const zones = await this.model.findAll({
      where: { venueId },
    });
    return zones;
  }

  async create(venueId, data) {
    await venueService.findOne(venueId); // Validar existencia del padre
    const newZone = await this.model.create({
      ...data,
      venueId,
    });
    return newZone;
  }

  async findOne(venueId, zoneId) {
    const zone = await this.model.findOne({
      where: {
        id: zoneId,
        venueId: venueId, // Aseguramos que la zona pertenece al recinto correcto
      },
    });
    if (!zone) {
      throw boom.notFound('Zone not found in this venue');
    }
    return zone;
  }

  async update(venueId, zoneId, changes) {
    const zone = await this.findOne(venueId, zoneId); // Reutilizamos para validar
    const updatedZone = await zone.update(changes);
    return updatedZone;
  }

  async delete(venueId, zoneId) {
    const zone = await this.findOne(venueId, zoneId); // Reutilizamos para validar
    await zone.destroy();
    return { id: zoneId };
  }
}

module.exports = ZoneService;
