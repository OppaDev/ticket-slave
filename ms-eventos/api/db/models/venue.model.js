// api/db/models/venue.model.js
const { Model, DataTypes, Sequelize } = require('sequelize');

const VENUE_TABLE = 'venues';

const VenueSchema = {
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
  direccion: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  ciudad: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  pais: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  latitud: {
    allowNull: true,
    type: DataTypes.FLOAT,
  },
  longitud: {
    allowNull: true,
    type: DataTypes.FLOAT,
  },
  // DETALLE CLAVE: ¿Quién es el dueño de este recinto?
  organizerId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'organizer_id',
    // Nota: No hay 'references' porque 'users' está en otra BBDD.
    // La integridad se mantiene a nivel de aplicación.
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
};

class Venue extends Model {
  static associate(models) {
    this.hasMany(models.Zone, {
      as: 'zones',
      foreignKey: 'venueId',
    });
    // En el futuro, un Venue 'hasMany' Events.
    // this.hasMany(models.Event, {
    //   as: 'events',
    //   foreignKey: 'venueId',
    // });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: VENUE_TABLE,
      modelName: 'Venue',
      timestamps: false,
    };
  }
}

module.exports = { VENUE_TABLE, VenueSchema, Venue };
