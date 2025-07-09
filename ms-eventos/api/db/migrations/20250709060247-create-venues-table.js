'use strict';
const { VENUE_TABLE, VenueSchema } = require('../models/venue.model');
module.exports = {
  async up(queryInterface) { await queryInterface.createTable(VENUE_TABLE, VenueSchema); },
  async down(queryInterface) { await queryInterface.dropTable(VENUE_TABLE); }
};
