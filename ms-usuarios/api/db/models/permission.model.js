const { Model, DataTypes, Sequelize } = require('sequelize');

const PERMISSION_TABLE = 'permissions';

const PermissionSchema = {
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

class Permission extends Model {
  static associate(models) {
    this.belongsToMany(models.Role, {
      through: models.RoleHasPermission,
      foreignKey: 'permissionId',
      as: 'roles',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PERMISSION_TABLE,
      modelName: 'Permission',
      timestamps: false,
    };
  }
}

module.exports = { PERMISSION_TABLE, Permission, PermissionSchema };
