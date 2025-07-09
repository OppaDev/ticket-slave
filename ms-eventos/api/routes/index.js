const express = require('express');
const categoriesRouter = require('./categories.router.js');
const venuesRouter = require('./venues.router.js');
const eventsRouter = require('./events.router.js'); // <-- AÑADIR

function routerApi(app) {
  const router = express.Router();
  app.use('', router);

  router.use('/categories', categoriesRouter);
  router.use('/venues', venuesRouter);
  router.use('/events', eventsRouter); // <-- AÑADIR
}

module.exports = routerApi;
