// src/api/models/ticket.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Ticket extends Model { }
Ticket.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderItemId: { // Clave foránea para vincular al ítem de pedido específico
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'order_items',
            key: 'id',
        },
        field: 'order_item_id',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    ticketCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'ticket_code',
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'VALID',
        validate: {
            isIn: [['VALID', 'USED', 'CANCELLED']],
        },
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'event_id',
    },
    checkInTimestamp: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'check_in_timestamp',
    },
    qrCodeData: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'qr_code_data',
    },
    // Datos del titular para mostrar en la entrada
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'owner_name',
    }
}, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'tickets',
    timestamps: true,
    underscored: true,
});

module.exports = Ticket;