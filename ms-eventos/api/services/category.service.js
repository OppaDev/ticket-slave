// api/services/category.service.js
const boom = require('@hapi/boom');
const { sequelize } = require('../libs/sequelize');
const publisherService = require('./publisher.service');

class CategoryService {
  constructor() {
    this.model = sequelize.models.Category;
  }

  async create(data) {
    const newCategory = await this.model.create(data);

    // Publicar evento de creación
    try {
      await publisherService.publishCategoryCreated({
        id: newCategory.id,
        nombre: newCategory.nombre,
        descripcion: newCategory.descripcion
      });
    } catch (error) {
      console.error('Error publicando evento category.created:', error);
    }

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

    // Publicar evento de actualización
    try {
      await publisherService.publishCategoryUpdated({
        id: updatedCategory.id,
        nombre: updatedCategory.nombre,
        descripcion: updatedCategory.descripcion
      });
    } catch (error) {
      console.error('Error publicando evento category.updated:', error);
    }

    return updatedCategory;
  }

  async delete(id) {
    const category = await this.findOne(id);
    await category.destroy();

    // Publicar evento de eliminación
    try {
      await publisherService.publishCategoryDeleted(id);
    } catch (error) {
      console.error('Error publicando evento category.deleted:', error);
    }

    return { id };
  }
}

module.exports = CategoryService;
