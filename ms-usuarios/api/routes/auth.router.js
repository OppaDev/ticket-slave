const express = require('express');
const passport = require('passport');

const AuthService = require('../services/auth.service');
const { createUserSchema, loginSchema, logoutSchema, recoverySchema, changePasswordSchema } = require('../schemas/auth.schema');
const validatorHandler = require('../middlewares/validator.handler');
const service = new AuthService();

const router = express.Router();

router.post('/register',
  // passport.authenticate('jwt', { session: false }),
  validatorHandler(createUserSchema, 'body'),
  async (req, res, next) => {
    const body = req.body;
    try {
      const newUser = await service.create(body);
      res.status(201).json({
        message: 'created',
        data: newUser,
      });
    } catch (error) {
      next(error);
      // res.json(error);
    }
  }
);

router.post('/login',
  validatorHandler(loginSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      res.json(service.signToken(req.user));
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout',
  validatorHandler(logoutSchema, 'body'),
  async (req, res, next) => {
    try {
      const { token } = req.body;

    } catch (error) {
      next(error);
    }
  }

)

router.post('/recover',
  validatorHandler(recoverySchema, 'body'),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const rta = await service.resetPassword(email);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/reset',
  validatorHandler(changePasswordSchema, 'body'),
  async (req, res, next) => {
    try {
      const { token, password, passwordConfirmation } = req.body;
      const rta = await service.changePassword(token, password, passwordConfirmation);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
