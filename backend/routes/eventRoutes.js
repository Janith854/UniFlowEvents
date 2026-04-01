const express = require('express');
const router = express.Router();
const { 
    getEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    generateTicket,
    updateEventStatus,
    inviteUsers,
    analyzeEventFeedback
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { detectConflict } = require('../middleware/conflictMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/ticket', protect, generateTicket);

// Phase 2 endpoints
router.patch('/:id/status', protect, authorizeRoles('organizer', 'admin'), updateEventStatus);
router.post('/:id/invite', protect, authorizeRoles('organizer', 'admin'), inviteUsers);
router.get('/:id/analyze', protect, authorizeRoles('organizer', 'admin'), analyzeEventFeedback);

// Create event with upload and conflict detection
router.post('/', protect, authorizeRoles('organizer', 'admin'), upload.single('image'), detectConflict, createEvent);
router.put('/:id', protect, authorizeRoles('organizer', 'admin'), upload.single('image'), detectConflict, updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
