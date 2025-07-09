const express = require('express');

const UsersService = require('../services/user.service');
const {
  updateUserSchema,
  getUserSchema,
  assignRoleSchema } = require('../schemas/user.schema');
const validatorHandler = require('../middlewares/validator.handler');
const passport = require('passport');

const router = express.Router();
const service = new UsersService();


router.get('/', async (req, res) => {
  const categories = await service.find();
  res.json(categories);
});

router.get('/:id/role',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const roles = await service.getRoles(id);
      res.status(200).json({
        message: 'Role found',
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/role',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(assignRoleSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    const { id } = req.params;
    try {
      const roles = await service.assignRole(id, body);
      res.status(200).json({
        message: 'Role assigned',
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id',
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => { //luego el middleware de response
    const { id } = req.params;
    try {
      const user = await service.findOne(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getUserSchema, 'params'),
  validatorHandler(updateUserSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    const { id } = req.params;
    try {
      const category = await service.update(id, body);

      res.status(200).json({
        message: 'updated',
        data: category
      });
    } catch (error) {
      next(error);
    }
  });
router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getUserSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const rta = await service.delete(id);

      res.json({ rta });
    } catch (error) {
      next(error);
    }

  });

module.exports = router;
