// api/routes/venues.router.js
const express = require('express');
const passport = require('passport');

// Importamos ambos servicios
const VenueService = require('../services/venue.service');
const ZoneService = require('../services/zone.service');

const validatorHandler = require('../middlewares/validator.handler');
const { checkRoles } = require('../middlewares/auth.handler');

const { createVenueSchema, updateVenueSchema, getVenueSchema } = require('../schemas/venue.schema');
const { createZoneSchema, updateZoneSchema, getZoneSchema, getZonesByVenueSchema } = require('../schemas/zone.schema');

const router = express.Router();
const venueService = new VenueService();
const zoneService = new ZoneService();

// ===================================
//  RUTAS PARA RECURSO PRINCIPAL: VENUES
// ===================================

router.get('/', async (req, res, next) => {
  try {
    const venues = await venueService.find();
    res.json(venues);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  validatorHandler(getVenueSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const venue = await venueService.findOne(id);
      res.json(venue);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(createVenueSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const organizerId = req.user.sub;
      const newVenue = await venueService.create(body, organizerId);
      res.status(201).json(newVenue);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getVenueSchema, 'params'),
  validatorHandler(updateVenueSchema, 'body'),
  async (req, res, next) => {
    try {
      // TODO: Validar que el usuario (req.user.sub) sea el dueño del recinto (venue.organizerId)
      const { id } = req.params;
      const body = req.body;
      const updatedVenue = await venueService.update(id, body);
      res.json(updatedVenue);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getVenueSchema, 'params'),
  async (req, res, next) => {
    try {
      // TODO: Validar que el usuario (req.user.sub) sea el dueño del recinto (venue.organizerId)
      const { id } = req.params;
      await venueService.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);


// ===================================
//  RUTAS PARA RECURSO ANIDADO: ZONES
// ===================================

router.get('/:venueId/zones',
  validatorHandler(getZonesByVenueSchema, 'params'),
  async (req, res, next) => {
    try {
      const { venueId } = req.params;
      const zones = await zoneService.findByVenue(venueId);
      res.json(zones);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:venueId/zones',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getZonesByVenueSchema, 'params'),
  validatorHandler(createZoneSchema, 'body'),
  async (req, res, next) => {
    try {
      // TODO: Validar que el usuario (req.user.sub) sea el dueño del recinto (venueId)
      const { venueId } = req.params;
      const body = req.body;
      const newZone = await zoneService.create(venueId, body);
      res.status(201).json(newZone);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:venueId/zones/:id',
  validatorHandler(getZoneSchema, 'params'),
  async (req, res, next) => {
    try {
      const { venueId, id } = req.params;
      const zone = await zoneService.findOne(venueId, id);
      res.json(zone);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:venueId/zones/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getZoneSchema, 'params'),
  validatorHandler(updateZoneSchema, 'body'),
  async (req, res, next) => {
    try {
      // TODO: Validar que el usuario (req.user.sub) sea el dueño del recinto (venueId)
      const { venueId, id } = req.params;
      const body = req.body;
      const updatedZone = await zoneService.update(venueId, id, body);
      res.json(updatedZone);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:venueId/zones/:id',
  passport.authenticate('jwt', { session: false }),
  checkRoles('admin', 'organizer'),
  validatorHandler(getZoneSchema, 'params'),
  async (req, res, next) => {
    try {
      // TODO: Validar que el usuario (req.user.sub) sea el dueño del recinto (venueId)
      const { venueId, id } = req.params;
      await zoneService.delete(venueId, id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
