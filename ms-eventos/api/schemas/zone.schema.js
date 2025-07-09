// api/schemas/zone.schema.js
const Joi = require('joi');

const id = Joi.string();
const venueId = Joi.number().integer();
const nombre = Joi.string().min(3).max(50);
const capacidad = Joi.number().integer().min(1);

const createZoneSchema = Joi.object({
  nombre: nombre.required(),
  capacidad: capacidad.required(),
});

const updateZoneSchema = Joi.object({
  nombre: nombre.optional(),
  capacidad: capacidad.optional(),
});

// Valida los IDs de la ruta para una zona específica (ej: /venues/1/zones/101)
const getZoneSchema = Joi.object({
  venueId: venueId.required(),
  id: id.required(), // 'id' corresponde al zoneId en la ruta
});

// Valida el ID de la ruta para listar/crear zonas (ej: /venues/1/zones)
const getZonesByVenueSchema = Joi.object({
  venueId: venueId.required(),
});

module.exports = { createZoneSchema, updateZoneSchema, getZoneSchema, getZonesByVenueSchema };
