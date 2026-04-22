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
    analyzeEventFeedback,
    checkOrganizerConflict
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { detectConflict } = require('../middleware/conflictMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getEvents);
router.get('/check-conflict', protect, authorizeRoles('organizer'), checkOrganizerConflict);
router.get('/:id', getEventById);
router.post('/:id/ticket', protect, generateTicket);

// Phase 2 endpoints (organizer only — 'admin' role does not exist in this system)
router.patch('/:id/status', protect, authorizeRoles('organizer'), updateEventStatus);
router.post('/:id/invite', protect, authorizeRoles('organizer'), inviteUsers);
router.get('/:id/analyze', protect, authorizeRoles('organizer'), analyzeEventFeedback);

// Create event with upload and conflict detection
router.post('/', protect, authorizeRoles('organizer'), upload.single('image'), detectConflict, createEvent);
router.put('/:id', protect, authorizeRoles('organizer'), upload.single('image'), detectConflict, updateEvent);
router.delete('/:id', protect, authorizeRoles('organizer'), deleteEvent);

module.exports = router;
