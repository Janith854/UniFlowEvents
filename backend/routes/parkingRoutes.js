const express = require('express');
const router = express.Router();
const {
    getParkingStatus,
    getParkingAnalytics,
    createCheckoutSession,
    confirmPayment,
    cancelParkingReservation
} = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/status/:eventId', protect, getParkingStatus);
// Analytics are organizer-only and scoped to their own events
router.get('/analytics', protect, authorizeRoles('organizer'), getParkingAnalytics);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm-payment', protect, confirmPayment);
router.delete('/:id', protect, cancelParkingReservation);

module.exports = router;
