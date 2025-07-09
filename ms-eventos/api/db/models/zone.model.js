// api/db/models/zone.model.js
const { Model, DataTypes, Sequelize } = require('sequelize');
const { VENUE_TABLE } = require('./venue.model');

const ZONE_TABLE = 'zones';

const ZoneSchema = {
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
  capacidad: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  // Este es el FK que lo une al recinto
  venueId: {
    field: 'venue_id',
    allowNull: false,
    type: DataTypes.INTEGER,
    references: {
      model: VENUE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Si se borra el recinto, se borran sus zonas
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
};

class Zone extends Model {
  static associate(models) {
    this.belongsTo(models.Venue, { as: 'venue' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ZONE_TABLE,
      modelName: 'Zone',
      timestamps: false,
    };
  }
}

module.exports = { ZONE_TABLE, ZoneSchema, Zone };
