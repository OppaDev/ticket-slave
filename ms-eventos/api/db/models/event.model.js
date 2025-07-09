// api/db/models/event.model.js
const { Model, DataTypes, Sequelize } = require('sequelize');
const { CATEGORY_TABLE } = require('./category.model');
const { VENUE_TABLE } = require('./venue.model');

const EVENT_TABLE = 'events';

const EventSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  descripcion: {
    allowNull: false,
    type: DataTypes.TEXT, // Usamos TEXT para descripciones largas
  },
  fechaInicio: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'fecha_inicio',
  },
  fechaFin: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'fecha_fin',
  },
  imagenUrl: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'imagen_url',
  },
  // Gestión de estado del evento
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'BORRADOR', // Los eventos se crean como borrador por defecto
  },
  // --- Claves Foráneas ---
  categoryId: {
    field: 'category_id',
    allowNull: true, // Puede ser nulo si se borra la categoría
    type: DataTypes.INTEGER,
    references: {
      model: CATEGORY_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  venueId: {
    field: 'venue_id',
    allowNull: true, // Puede ser nulo si se borra el recinto
    type: DataTypes.INTEGER,
    references: {
      model: VENUE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  // ID del dueño del evento (de ms-usuarios)
  organizerId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'organizer_id',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
};

class Event extends Model {
  static associate(models) {
    this.belongsTo(models.Category, { as: 'category' });
    this.belongsTo(models.Venue, { as: 'venue' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: EVENT_TABLE,
      modelName: 'Event',
      timestamps: false,
    };
  }
}

module.exports = { EVENT_TABLE, EventSchema, Event };
