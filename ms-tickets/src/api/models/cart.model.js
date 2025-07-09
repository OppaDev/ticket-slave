// src/api/models/cart.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

// Modelo para el contenedor del Carrito
class Cart extends Model { }
Cart.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Cada usuario solo tiene un carrito activo
        field: 'user_id',
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
    },
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    underscored: true,
});


// Modelo para los Ítems dentro del Carrito
class CartItem extends Model { }
CartItem.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // cartId y ticketTypeId se definen a través de las asociaciones
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    priceAtReservation: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'price_at_reservation',
    }
}, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: false, // Los ítems no necesitan sus propios timestamps
    underscored: true,
});

module.exports = { Cart, CartItem };