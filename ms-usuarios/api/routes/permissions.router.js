const express = require('express');
const validatorHandler = require('../middlewares/validator.handler');
const PermissionService = require('../services/permission.service');
const { createPermissionSchema, updatePermissionSchema, getPermissionSchema } = require('../schemas/permission.schema');

const router = express.Router();
const service = new PermissionService();

router.post('/',
  validatorHandler(createPermissionSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newPermission = await service.create(body);
      res.status(201).json(newPermission);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  async (req, res, next) => {
    try {
      const permissions = await service.find();
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  validatorHandler(getPermissionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const permission = await service.findOne(id);
      res.json(permission);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  validatorHandler(getPermissionSchema, 'params'),
  validatorHandler(updatePermissionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedPermission = await service.update(id, body);
      res.json(updatedPermission);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validatorHandler(getPermissionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedPermission = await service.delete(id);
      res.json(deletedPermission);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
