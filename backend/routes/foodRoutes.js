const express = require('express');
const router = express.Router();
const { getFoodOrders, createFoodOrder, updateFoodOrder, deleteFoodOrder } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFoodOrders);
router.post('/', protect, createFoodOrder);
router.put('/:id', protect, updateFoodOrder);
router.delete('/:id', protect, deleteFoodOrder);

module.exports = router;
