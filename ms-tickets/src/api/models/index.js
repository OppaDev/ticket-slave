// src/api/models/index.js
const { sequelize } = require('../../config/database');
const TicketType = require('./ticketType.model');
const { Cart, CartItem } = require('./cart.model');
const { Order, OrderItem } = require('./order.model');
const Ticket = require('./ticket.model');
const EventReplica = require('./eventReplica.model');
const CategoryReplica = require('./categoryReplica.model');

// Importar modelos
const db = {
    sequelize,
    TicketType,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Ticket,
    EventReplica,
    CategoryReplica
};

// --- Definir Asociaciones ---

// === CART RELATIONSHIPS ===
// Relaciones 'hacia afuera' (BelongsTo)
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cartId' });
db.CartItem.belongsTo(db.TicketType, { as: 'ticketType', foreignKey: 'ticketTypeId' });

// Relaciones 'hacia adentro' (HasMany)
db.Cart.hasMany(db.CartItem, { as: 'items', foreignKey: 'cartId', onDelete: 'CASCADE' });

// === ORDER RELATIONSHIPS ===
// Relaciones 'hacia afuera' (BelongsTo)
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.TicketType, { as: 'ticketType', foreignKey: 'ticketTypeId' });

// Relaciones 'hacia adentro' (HasMany)
db.Order.hasMany(db.OrderItem, { as: 'items', foreignKey: 'orderId' });

// === TICKET RELATIONSHIPS ===
// Un Ticket pertenece a un OrderItem (para generar múltiples tickets por ítem)
db.Ticket.belongsTo(db.OrderItem, { foreignKey: 'orderItemId' });
db.OrderItem.hasMany(db.Ticket, { foreignKey: 'orderItemId' });

// === TICKETTYPE RELATIONSHIPS ===
// TicketType es referenciado por CartItems y OrderItems
db.TicketType.hasMany(db.CartItem, { as: 'cartItems', foreignKey: 'ticketTypeId' });
db.TicketType.hasMany(db.OrderItem, { as: 'orderItems', foreignKey: 'ticketTypeId' });

// === EXTERNAL MICROSERVICE RELATIONSHIPS ===
// Un Ticket pertenece a un Usuario (para facilitar la consulta "Mis Entradas")
// Asumimos que el modelo de Usuario existe en otro microservicio, pero guardamos el ID
// db.Ticket.belongsTo(db.User, { foreignKey: 'userId' });
// db.User.hasMany(db.Ticket, { foreignKey: 'userId' });

// TicketType pertenece a un Event (gestionado por el microservicio de eventos)
// db.TicketType.belongsTo(db.Event, { foreignKey: 'eventId' });
// db.Event.hasMany(db.TicketType, { foreignKey: 'eventId' });


module.exports = db;