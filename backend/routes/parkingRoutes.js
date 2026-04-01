const express = require('express');
const router = express.Router();
const { 
    getParkingStatus, 
    createCheckoutSession, 
    confirmPayment, 
    cancelParkingReservation 
} = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status/:eventId', protect, getParkingStatus);
router.get('/analytics', protect, require('../controllers/parkingController').getParkingAnalytics);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm-payment', protect, confirmPayment);
router.delete('/:id', protect, cancelParkingReservation);

module.exports = router;
