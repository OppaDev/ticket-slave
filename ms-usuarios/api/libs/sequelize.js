// libs/sequelize.js
const { Sequelize } = require('sequelize');

const { config } = require('../config/config');
const { setupModels } = require('../db/models');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const HOST = encodeURIComponent(config.dbHost);
const DB_NAME = encodeURIComponent(config.dbName);
const PORT = encodeURIComponent(config.dbPort);
const IS_PROD = encodeURIComponent(config.isProd);

// const URI = `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}`;

let URI = '';

const options = {
  dialect: 'postgres',
  logging: config.isProd ? false : true,
}

if (IS_PROD === 'true') {
  URI = config.dbUrl;
  options.ssl = {
    rejectUnauthorized: false
  }
} else {
  URI = `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}`;
}

const sequelize = new Sequelize(URI, options);

sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos exitosa');
  })
  .catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

setupModels(sequelize);

//sequelize.sync(); // sirve para que se sincronice con la base de datos

module.exports = { sequelize };
