const express = require('express');
const router = express.Router();
const { getAllFeedback, createFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllFeedback);
router.post('/', protect, createFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
