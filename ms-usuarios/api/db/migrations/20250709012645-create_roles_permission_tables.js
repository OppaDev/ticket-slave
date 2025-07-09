'use strict';

const { RoleSchema, ROLE_TABLE } = require('../models/role.model');
const { RoleHasPermissionSchema, ROLE_HAS_PERMISSION_TABLE } = require('../models/role_has_permission.model');
const { PermissionSchema, PERMISSION_TABLE } = require('../models/permission.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(ROLE_TABLE, RoleSchema);
    await queryInterface.createTable(PERMISSION_TABLE, PermissionSchema);
    await queryInterface.createTable(ROLE_HAS_PERMISSION_TABLE, RoleHasPermissionSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(ROLE_HAS_PERMISSION_TABLE);
    await queryInterface.dropTable(PERMISSION_TABLE);
    await queryInterface.dropTable(ROLE_TABLE);
  }
};
