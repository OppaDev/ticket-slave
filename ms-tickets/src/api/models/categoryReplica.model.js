// src/api/models/categoryReplica.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class CategoryReplica extends Model {}

CategoryReplica.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // No autoIncrement - viene del ms-eventos
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'last_sync_at',
    }
}, {
    sequelize,
    modelName: 'CategoryReplica',
    tableName: 'categories_replica',
    timestamps: true,
    underscored: true,
});

module.exports = CategoryReplica;