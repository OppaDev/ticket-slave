'use strict';
const { ZONE_TABLE, ZoneSchema } = require('../models/zone.model');
module.exports = {
  async up(queryInterface) { await queryInterface.createTable(ZONE_TABLE, ZoneSchema); },
  async down(queryInterface) { await queryInterface.dropTable(ZONE_TABLE); }
};
