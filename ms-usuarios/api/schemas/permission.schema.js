const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(20).required();
const descripcion = Joi.string().max(255);

const createPermissionSchema = Joi.object({
  nombre: nombre.required(),
  descripcion: descripcion.optional()
});

const updatePermissionSchema = Joi.object({
  nombre: nombre.optional(),
  descripcion: descripcion.optional()
});

const getPermissionSchema = Joi.object({
  id: id.required()
});

module.exports = { createPermissionSchema, updatePermissionSchema, getPermissionSchema };
