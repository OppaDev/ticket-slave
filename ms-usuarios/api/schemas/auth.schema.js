const Joi = require('joi');

const nombre = Joi.string().min(3).max(15);
const roleId = Joi.string();
const email = Joi.string().email().required();
const password = Joi.string().min(8).required();
const passwordConfirmation = Joi.string()
  .valid(Joi.ref('password'))
  .required()
  .messages({
    'any.only': 'Password confirmation must match the password.',
  });
const token = Joi.string().required();
const apellido = Joi.string();
const status = Joi.string().valid('active', 'inactive').default('active');
const fechaNacimiento = Joi.date();
const pais = Joi.string();
const aceptaTerminos = Joi.boolean();
const recoveryToken = Joi.string().optional();

const createUserSchema = Joi.object({
  nombre: nombre.required(),
  apellido: apellido.required(),
  roleId: roleId.required(),
  email: email.required(),
  password: password.required(),
  fechaNacimiento: fechaNacimiento.required(),
  pais: pais.required(),
  status: status.optional(),
  aceptaTerminos: aceptaTerminos.required()
});

const loginSchema = Joi.object({
  email,
  password,
});

const logoutSchema = Joi.object({
  token,
});

const recoverySchema = Joi.object({
  email,
});

const changePasswordSchema = Joi.object({
  token,
  password,
  passwordConfirmation
});

module.exports = {
  createUserSchema,
  loginSchema,
  logoutSchema,
  recoverySchema,
  changePasswordSchema
};


// jsons de ejemplo

/*
Ejemplo para createUserSchema:
{
  "nombre": "Carlos",
  "apellido": "Ramirez",
  "email": "carlos.ramirez@example.com",
  "password": "SuperSecret123",
  "fechaNacimiento": "1990-05-15",
  "pais": "Mexico",
  "aceptaTerminos": true,
  "status": "active"
}

Ejemplo para loginSchema:
{
  "email": "carlos.ramirez@example.com",
  "password": "SuperSecret123"
}

Ejemplo para logoutSchema:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}

Ejemplo para recoverySchema:
{
  "email": "carlos.ramirez@example.com"
}

Ejemplo para changePasswordSchema:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "password": "NewSecret456",
  "passwordConfirmation": "NewSecret456"
}
*/
