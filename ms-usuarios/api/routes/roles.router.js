const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const RoleService = require('../services/role.service');
const { createRoleSchema, updateRoleSchema, getRoleSchema, assignPermissionsSchema } = require('../schemas/role.schema');
const { assign } = require('nodemailer/lib/shared');

const router = express.Router();
const service = new RoleService();

router.post('/',
  validatorHandler(createRoleSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newRole = await service.create(body);
      res.status(201).json(newRole);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  async (req, res, next) => {
    try {
      const roles = await service.find();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  validatorHandler(getRoleSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const role = await service.findOne(id);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(getRoleSchema, 'params'),
  validatorHandler(updateRoleSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedRole = await service.update(id, body);
      res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getRoleSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedRole = await service.delete(id);
      res.json(deletedRole);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/permissions',
  validatorHandler(getRoleSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const permissions = await service.getPermissions(id); // Assuming getPermissions is a method in the Role model
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }
)

router.post('/:id/permissions',
  validatorHandler(getRoleSchema, 'params'),
  validatorHandler(assignPermissionsSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const updatedRole = await service.assignPermissions(id, permissions);
      res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
