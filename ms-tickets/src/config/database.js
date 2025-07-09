const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';

let sequelize;

if (isTest) {
    // Configuración para pruebas con SQLite
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Configuración para producción/desarrollo con DATABASE_URL
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });
}

module.exports = {
    sequelize,
    Sequelize
};