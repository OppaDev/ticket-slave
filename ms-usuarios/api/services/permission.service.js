const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');

class PermissionService {
  constructor() {
    this.model = sequelize.models.Permission;
  }

  async create(data) {
    const newPermission = await this.model.create(data);
    return newPermission;
  }

  async find() {
    const permissions = await this.model.findAll();
    return permissions;
  }

  async findOne(id) {
    const permission = await this.model.findByPk(id);
    if (!permission) {
      throw boom.notFound('Permission not found');
    }
    return permission;
  }

  async update(id, changes) {
    const permission = await this.findOne(id);
    const updatedPermission = await permission.update(changes);
    return updatedPermission;
  }

  async delete(id) {
    const permission = await this.findOne(id);
    await permission.destroy();
    return { id };
  }
}

module.exports = PermissionService;
