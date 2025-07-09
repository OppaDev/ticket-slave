const express = require('express');
const passport = require('passport');
const EventService = require('../services/event.service');
const validatorHandler = require('../middlewares/validator.handler');
const { checkRoles } = require('../middlewares/auth.handler');
const { createEventSchema, updateEventSchema, getEventSchema, queryEventSchema } = require('../schemas/event.schema');

const router = express.Router();
const service = new EventService();

router.get('/',
  validatorHandler(queryEventSchema, 'query'),
  // Opcional: hacemos que el usuario esté disponible incluso si no es obligatorio
  (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      req.user = user; // Asigna el usuario si el token es válido, o null si no lo es/no existe
      next();
    })(req, res, next);
  },
  async (req, res, next) => {
    try {
      const events = await service.find(req.query, req.user);
      res.json(events);
    } catch (error) { next(error); }
  }
);

router.get('/:id',
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const event = await service.findOne(id);
      res.json(event);
    } catch (error) { next(error); }
  }
);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(createEventSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const organizerId = req.user.sub;
      const newEvent = await service.create(body, organizerId);
      res.status(201).json(newEvent);
    } catch (error) { next(error); }
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getEventSchema, 'params'),
  validatorHandler(updateEventSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updatedEvent = await service.update(id, body, req.user);
      res.json(updatedEvent);
    } catch (error) { next(error); }
  }
);

router.post('/:id/publish',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getEventSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const publishedEvent = await service.publish(id, req.user);
      res.json(publishedEvent);
    } catch (error) { next(error); }
  }
);

module.exports = router;
