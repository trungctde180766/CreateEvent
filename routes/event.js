const express = require('express');
const EventController = require('../controllers/eventController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddlewares');
const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin'), EventController.createEvent);

router.get('/', EventController.getAllEvents);

router.get('/with-count', EventController.getEventsWithRegistrationCount);

router.get('/:id', EventController.getEventById);

router.put('/:id', authenticateToken, authorizeRoles('admin'), EventController.updateEvent);

router.delete('/:id', authenticateToken, authorizeRoles('admin'), EventController.deleteEvent);

router.get('/searchByDate', EventController.searchEventsByDate);

module.exports = router; 