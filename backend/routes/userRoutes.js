const express = require('express');
const router = express.Router();
const {
	getAllUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser,
	getMyProfile,
	updateMyProfile,
	deactivateUser,
	forgotPassword,
	resetPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Rate limiter for sensitive password endpoints
let rateLimit;
try {
    rateLimit = require('express-rate-limit');
} catch (_) {
    rateLimit = () => (req, res, next) => next();
}

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many requests. Please try again after 15 minutes.' },
});

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

router.get('/', protect, authorizeRoles('organizer'), getAllUsers);
router.post('/', protect, authorizeRoles('organizer'), createUser);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.patch('/:id/deactivate', protect, deactivateUser);

router.post('/forgot-password', passwordLimiter, forgotPassword);
router.post('/reset-password', passwordLimiter, resetPassword);

module.exports = router;
