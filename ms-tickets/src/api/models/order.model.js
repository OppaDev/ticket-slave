// src/api/models/order.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

class Order extends Model { }
Order.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderCode: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(), // Genera un código único para el cliente
        allowNull: false,
        unique: true,
        field: 'order_code',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_amount',
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        field: 'currency',
    }, 
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
        validate: {
            isIn: [['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']],
        },
    },
    paymentGatewayId: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser nulo si el pago falla
        field: 'payment_gateway_id',
    },
    billingAddress: {
        type: DataTypes.JSONB,
        allowNull: true, // La dirección de facturación
        field: 'billing_address',
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
});

class OrderItem extends Model { }
OrderItem.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // orderId y ticketTypeId se definen por asociación
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    priceAtPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_at_purchase',
    }
}, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
});


module.exports = { Order, OrderItem };