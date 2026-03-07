const express = require('express');
const router = express.Router();
const { getParkingReservations, createParkingReservation, updateParkingReservation, deleteParkingReservation } = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getParkingReservations);
router.post('/', protect, createParkingReservation);
router.put('/:id', protect, updateParkingReservation);
router.delete('/:id', protect, deleteParkingReservation);

module.exports = router;
