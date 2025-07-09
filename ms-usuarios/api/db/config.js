const { config } = require('../config/config');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const HOST = encodeURIComponent(config.dbHost);
const DB_NAME = encodeURIComponent(config.dbName);
const PORT = encodeURIComponent(config.dbPort);

const URI = `postgres://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}`;

module.exports = {
  development: {
    url: URI,
    dialect: 'postgres',
  },
  production: {
    url: URI,
    dialect: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  }
}
