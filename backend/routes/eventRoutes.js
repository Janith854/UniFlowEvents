const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorizeRoles('admin'), createEvent);
router.put('/:id', protect, authorizeRoles('admin'), updateEvent);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEvent);

module.exports = router;
