// api/db/models/category.model.js
const { Model, DataTypes, Sequelize } = require('sequelize');

const CATEGORY_TABLE = 'categories';

const CategorySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  nombre: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true, // Un nombre de categoría debe ser único
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

class Category extends Model {
  static associate(models) {
    // En el futuro, un Category 'hasMany' Events.
    // Lo añadiremos cuando creemos el modelo Event.
    this.hasMany(models.Event, {
      as: 'events',
      foreignKey: 'categoryId',
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: CATEGORY_TABLE,
      modelName: 'Category',
      timestamps: false, // Ya manejamos createdAt manualmente
    };
  }
}

module.exports = { CATEGORY_TABLE, CategorySchema, Category };
