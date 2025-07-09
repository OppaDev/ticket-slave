require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'supersecret', // Usa la misma clave que ms-usuarios
};
