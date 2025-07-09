// api/schemas/category.schema.js
const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(50);
const descripcion = Joi.string().max(255);

const createCategorySchema = Joi.object({
  nombre: nombre.required(),
  descripcion: descripcion.optional(),
});

const updateCategorySchema = Joi.object({
  nombre: nombre.optional(),
  descripcion: descripcion.optional(),
});

const getCategorySchema = Joi.object({
  id: id.required(),
});

module.exports = { createCategorySchema, updateCategorySchema, getCategorySchema };
