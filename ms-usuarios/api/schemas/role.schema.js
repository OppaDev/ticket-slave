const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(20).required();
const descripcion = Joi.string().max(255);
const permissions = Joi.array().items(Joi.number().integer());

const createRoleSchema = Joi.object({
  nombre: nombre.required(),
  descripcion: descripcion.optional()
});

const updateRoleSchema = Joi.object({
  nombre: nombre.optional(),
  descripcion: descripcion.optional()
});

const getRoleSchema = Joi.object({
  id: id.required()
});

const assignPermissionsSchema = Joi.object({
  permissions: permissions.required()
});

module.exports = { createRoleSchema, updateRoleSchema, getRoleSchema, assignPermissionsSchema };
