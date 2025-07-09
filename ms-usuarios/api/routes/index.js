const express = require('express');

const usersRouter = require('./users.router');
const authRouter = require('./auth.router');
const permissionsRouter = require('./permissions.router');
const rolesRouter = require('./roles.router');
const { checkRole } = require('../middlewares/auth.handler');
const passport = require('passport');

function routerApi(app) {

  const router = express.Router();
  app.use('', router);

  router.use('/users',
    // passport.authenticate('jwt', { session: false }),
    // checkRole('admin'),
    usersRouter);
  router.use('/auth', authRouter);
  router.use('/permissions', permissionsRouter);
  router.use('/roles', rolesRouter);
}

module.exports = routerApi;
