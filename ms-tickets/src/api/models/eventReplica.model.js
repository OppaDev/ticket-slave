// src/api/models/eventReplica.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class EventReplica extends Model {}

EventReplica.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // No autoIncrement - viene del ms-eventos
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    fechaInicio: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'fecha_inicio',
    },
    fechaFin: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'fecha_fin',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'BORRADOR',
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'category_id',
    },
    venueId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'venue_id',
    },
    organizerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'organizer_id',
    },
    // Campo para tracking de sincronización
    lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'last_sync_at',
    }
}, {
    sequelize,
    modelName: 'EventReplica',
    tableName: 'events_replica',
    timestamps: true,
    underscored: true,
});

module.exports = EventReplica;