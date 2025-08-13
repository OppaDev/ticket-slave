const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const { sequelize } = require('../libs/sequelize');

class UserService {

  constructor() {
    this.model = sequelize.models.User;
    this.roleModel = sequelize.models.Role;
  }

  async generate() {
  }

  async create(body) {
    const hash = await bcrypt.hash(body.password, 10);
    const newUser = await this.model.create({
      ...body,
      password: hash,
    });
    delete newUser.dataValues.password;
    return newUser;
  }

  async find() {
    const rta = await this.model.findAll();
    return rta;
  }

  async findByEmail(email) {
    const user = await this.model.findOne({
      where: { email },
      include: ['role']
    }
    );
    if (!user) {
      throw boom.notFound();
    } else {
      return user;
    }
  }

  async findOne(id) {
    const user = await this.model.findByPk(id, {
      include: [
        {
          model: this.roleModel,
          as: 'role',
          include: ['permissions']
        }
      ]
    });
    if (!user) {
      throw boom.notFound('User not found');
    } else {
      return user;
    }
  }

  async update(id, changes) {
    const user = await this.findOne(id);
    if (!user) {
      throw boom.notFound('User not found');
    } else {
      const rta = await user.update(changes);
      return rta;
    }
  }

  async delete(id) {
    const user = await this.findOne(id);
    if (!user) {
      throw boom.notFound('User not found');
    } else {
      await user.destroy();
      return {
        id,
        message: 'User deleted',
      }
    }
  }

  async getRoles(id) {
    const user = await this.model.findByPk(id, {
      include: ['role']
    });
    if (!user) {
      throw boom.notFound('User not found');
    }
    return user.role;
  }

  async assignRole(id, body) {
    const user = await this.findOne(id);
    if (!user) {
      throw boom.notFound('User not found');
    }
    const role = await this.roleModel.findByPk(body.roleId);
    if (!role) {
      throw boom.notFound('Role not found');
    }
    await user.setRole(role);
    const updatedUser = await this.model.findByPk(id, {
      include: ['role']
    });
    return updatedUser;
  }
}

module.exports = UserService;
