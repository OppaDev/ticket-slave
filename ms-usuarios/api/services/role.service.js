const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');

class RoleService {
  constructor() {
    this.model = sequelize.models.Role;
    this.permissionModel = sequelize.models.Permission;
    this.roleHasPermissionModel = sequelize.models.RoleHasPermission;
  }

  async create(data) {
    const newRole = await this.model.create(data);
    return newRole;
  }

  async find() {
    const roles = await this.model.findAll();
    return roles;
  }

  async findOne(id) {
    const role = await this.model.findByPk(id);
    if (!role) {
      throw boom.notFound('Role not found');
    }
    return role;
  }

  async update(id, changes) {
    const role = await this.findOne(id);
    const updatedRole = await role.update(changes);
    return updatedRole;
  }

  async delete(id) {
    const role = await this.findOne(id);
    await role.destroy();
    return { id };
  }

  async getPermissions(id) {
    const role = await this.model.findByPk(id, {
      include: ['permissions']
    });
    if (!role) {
      throw boom.notFound('Role not found');
    }
    return role.permissions;
  }

  async assignPermissions(id, permissions) {
    const role = await this.findOne(id);
    const currentPermissions = await role.getPermissions();

    // Remove existing permissions
    for (const perm of currentPermissions) {
      await role.removePermission(perm);
    }

    // Add new permissions
    for (const permId of permissions) {
      const permission = await this.permissionModel.findByPk(permId);
      if (!permission) {
        throw boom.notFound(`Permission with id ${permId} not found`);
      }
      await role.addPermission(permission);
    }
    const updatedRole = await this.model.findByPk(id, {
      include: ['permissions']
    });

    return updatedRole;
  }
}

module.exports = RoleService;
