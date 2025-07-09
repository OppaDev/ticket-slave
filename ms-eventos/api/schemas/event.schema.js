// api/schemas/event.schema.js
const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(5);
const descripcion = Joi.string().min(20);
const fechaInicio = Joi.date();
const fechaFin = Joi.date().greater(Joi.ref('fechaInicio'));
const imagenUrl = Joi.string().uri();
const categoryId = Joi.number().integer();
const venueId = Joi.number().integer();

// Para paginación y filtros
const limit = Joi.number().integer();
const offset = Joi.number().integer();

const createEventSchema = Joi.object({
  nombre: nombre.required(),
  descripcion: descripcion.required(),
  fechaInicio: fechaInicio.required(),
  fechaFin: fechaFin.required(),
  imagenUrl: imagenUrl.optional(),
  categoryId: categoryId.required(),
  venueId: venueId.required(),
});

const updateEventSchema = Joi.object({
  nombre: nombre.optional(),
  descripcion: descripcion.optional(),
  fechaInicio: fechaInicio.optional(),
  fechaFin: fechaFin.optional(),
  imagenUrl: imagenUrl.optional(),
  categoryId: categoryId.optional(),
  venueId: venueId.optional(),
});

const getEventSchema = Joi.object({
  id: id.required(),
});

const queryEventSchema = Joi.object({
  limit: limit,
  offset: offset,
  categoryId: categoryId,
  venueId: venueId,
});

module.exports = { createEventSchema, updateEventSchema, getEventSchema, queryEventSchema };
