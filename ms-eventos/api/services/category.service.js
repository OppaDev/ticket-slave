// api/services/category.service.js
const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');

class CategoryService {
  constructor() {
    this.model = sequelize.models.Category;
  }

  async create(data) {
    const newCategory = await this.model.create(data);
    return newCategory;
  }

  async find() {
    const categories = await this.model.findAll();
    return categories;
  }

  async findOne(id) {
    const category = await this.model.findByPk(id);
    if (!category) {
      throw boom.notFound('Category not found');
    }
    return category;
  }

  async update(id, changes) {
    const category = await this.findOne(id);
    const updatedCategory = await category.update(changes);
    return updatedCategory;
  }

  async delete(id) {
    const category = await this.findOne(id);
    await category.destroy();
    return { id };
  }
}

module.exports = CategoryService;
