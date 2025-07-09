const { Model, DataTypes, Sequelize } = require('sequelize');

const ROLE_TABLE = 'roles';

const RoleSchema = {
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
    allowNull: true,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
};

class Role extends Model {
  static associate(models) {
    this.belongsToMany(models.Permission, {
      through: models.RoleHasPermission,
      foreignKey: 'roleId',
      as: 'permissions',
    });
    this.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ROLE_TABLE,
      modelName: 'Role',
      timestamps: false,
    };
  }
}

module.exports = { ROLE_TABLE, Role, RoleSchema };
