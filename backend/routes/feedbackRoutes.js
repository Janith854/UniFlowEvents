const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback, deleteFeedback, replyToFeedback, getMyFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllFeedback);
router.get('/my', protect, getMyFeedback);
router.post('/', protect, createFeedback);
router.post('/:id/reply', protect, replyToFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
