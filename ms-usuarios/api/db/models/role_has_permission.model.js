const { Model, DataTypes, Sequelize } = require('sequelize');

const ROLE_HAS_PERMISSION_TABLE = 'role_has_permissions';

const RoleHasPermissionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  roleId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'role_id',
    references: {
      model: 'roles',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  permissionId: {
    allowNull: false,
    type: DataTypes.INTEGER,
    field: 'permission_id',
    references: {
      model: 'permissions',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
};

class RoleHasPermission extends Model {
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionId', as: 'permission' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ROLE_HAS_PERMISSION_TABLE,
      modelName: 'RoleHasPermission',
      timestamps: false,
    };
  }
}

module.exports = { ROLE_HAS_PERMISSION_TABLE, RoleHasPermission, RoleHasPermissionSchema };
