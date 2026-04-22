const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback, deleteFeedback, getFeedbackStats } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllFeedback);
router.get('/stats', protect, getFeedbackStats);
router.post('/', protect, createFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
