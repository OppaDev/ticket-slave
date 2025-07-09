// api/schemas/venue.schema.js
const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(100);
const direccion = Joi.string().min(5);
const ciudad = Joi.string().min(3);
const pais = Joi.string().min(2);
const latitud = Joi.number();
const longitud = Joi.number();

const createVenueSchema = Joi.object({
  nombre: nombre.required(),
  direccion: direccion.required(),
  ciudad: ciudad.required(),
  pais: pais.required(),
  latitud: latitud.optional(),
  longitud: longitud.optional(),
});

const updateVenueSchema = Joi.object({
  nombre: nombre.optional(),
  direccion: direccion.optional(),
  ciudad: ciudad.optional(),
  pais: pais.optional(),
  latitud: latitud.optional(),
  longitud: longitud.optional(),
});

const getVenueSchema = Joi.object({
  id: id.required(),
});

module.exports = { createVenueSchema, updateVenueSchema, getVenueSchema };
