// src/api/models/ticketType.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class TicketType extends Model {
    // Aquí puedes definir métodos de instancia si los necesitas
}

TicketType.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // Clave foránea para vincular con un evento (asumimos que los eventos se gestionan en otro microservicio, pero necesitamos el ID)
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'event_id',
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description',
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price',
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        field: 'currency',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'quantity',
    },
    sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'sold',
    },
    // Campo virtual para calcular los tickets disponibles
    available: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.quantity - this.sold;
        },
    },
    minPerPurchase: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'min_per_purchase',
    },
    maxPerPurchase: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        field: 'max_per_purchase',
    },
    saleStartDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'sale_start_date',
    },
    saleEndDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'sale_end_date',
    }
}, {
    sequelize,
    modelName: 'TicketType',
    tableName: 'ticket_types',
    timestamps: true,
    underscored: true,
});

module.exports = TicketType;