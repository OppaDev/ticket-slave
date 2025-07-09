// api/db/models/index.js
const { Category, CategorySchema } = require('./category.model.js');
const { Venue, VenueSchema } = require('./venue.model.js');
const { Zone, ZoneSchema } = require('./zone.model.js');
const { Event, EventSchema } = require('./event.model.js');

function setupModels(sequelize) {
  // Inicializar todos los modelos
  Category.init(CategorySchema, Category.config(sequelize));
  Venue.init(VenueSchema, Venue.config(sequelize));
  Zone.init(ZoneSchema, Zone.config(sequelize));
  Event.init(EventSchema, Event.config(sequelize));

  // Crear todas las asociaciones
  Category.associate(sequelize.models);
  Venue.associate(sequelize.models);
  Zone.associate(sequelize.models);
  Event.associate(sequelize.models);
}

module.exports = { setupModels };
