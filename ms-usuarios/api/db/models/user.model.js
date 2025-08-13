const { Model, DataTypes, Sequelize } = require('sequelize');

const USER_TABLE = 'users';
const { ROLE_TABLE } = require('./role.model');

const UserSchema = {
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
  apellido: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'activo',
  },
  fechaNacimiento: {
    allowNull: true,
    type: DataTypes.DATE,
  },
  pais: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  aceptaTerminos: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  roleId: {
    allowNull: true,
    type: DataTypes.INTEGER,
    field: 'role_id',
    references: {
      model: ROLE_TABLE,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  recoveryToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.fn('now'),
  },
}
class User extends Model {
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_TABLE,
      modelName: 'User',
      timestamps: false,
    }
  }
}

module.exports = { USER_TABLE, User, UserSchema };
