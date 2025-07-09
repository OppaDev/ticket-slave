//file schemas/product.schema.js
const Joi = require('joi');

const id = Joi.number().integer();
const nombre = Joi.string().min(3).max(15);
const email = Joi.string().email();
const roleId = Joi.number().integer();
const password = Joi.string().min(8);
const apellido = Joi.string();
const status = Joi.string().valid('activo', 'inactivo').default('activo');
const fechaNacimiento = Joi.date(); //ejemplo: '1990-01-01'
const pais = Joi.string();
const aceptaTerminos = Joi.boolean();

const createUserSchema = Joi.object({
  nombre: nombre.required(),
  apellido: apellido.required(),
  email: email.required(),
  password: password.required(),
  fechaNacimiento: fechaNacimiento.required(),
  pais: pais.required(),
  aceptaTerminos: aceptaTerminos.required()
});

const updateUserSchema = Joi.object({
  nombre: nombre.optional(),
  apellido: apellido.optional(),
  roleId: roleId.optional(),
  email: email.optional(),
  password: password.optional(),
  status: status.optional(),
  fechaNacimiento: fechaNacimiento.optional(),
  pais: pais.optional(),
  aceptaTerminos: aceptaTerminos.optional()
});

const getUserSchema = Joi.object({
  id: id.optional()
});

const assignRoleSchema = Joi.object({
  roleId: roleId.required()
});

module.exports = { createUserSchema, updateUserSchema, getUserSchema, assignRoleSchema }


// jsons de ejemplo
/*
Ejemplo para createUserSchema:
{
  "nombre": "Carlos",
  "apellido": "Ramirez",
  "email": "carlos.ramirez@example.com",
  "password": "superSecret1",
  "fechaNacimiento": "1992-05-14",
  "pais": "Argentina",
  "aceptaTerminos": true
}

Ejemplo para updateUserSchema:
{
  "nombre": "Ana",
  "email": "ana.nueva@example.com",
  "status": "activo",
  "pais": "Chile"
}

Ejemplo para getUserSchema:
{
  "id": 123
}
*/
