const express = require('express');
const router = express.Router();
const {
	getAllUsers,
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

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

router.get('/', protect, authorizeRoles('organizer'), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.patch('/:id/deactivate', protect, deactivateUser);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
