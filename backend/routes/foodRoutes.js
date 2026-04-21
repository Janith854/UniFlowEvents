const express = require('express');
const router = express.Router();
const {
  getMenu,
  createFoodOrder,
  getFoodOrders,
  updateFoodOrder,
  deleteFoodOrder,
  addCartLock,
  removeCartLock,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.get('/menu', getMenu);
router.post('/menu', protect, createMenuItem);
router.put('/menu/:id', protect, updateMenuItem);
router.delete('/menu/:id', protect, deleteMenuItem);

// Cart locking requires auth to prevent anonymous stock manipulation
router.post('/lock', protect, addCartLock);
router.delete('/lock', protect, removeCartLock);

// Food orders — require auth to read and write
router.get('/', protect, getFoodOrders);
router.post('/', protect, createFoodOrder);
router.post('/confirm-payment', protect, require('../controllers/foodController').confirmPayment);
router.put('/:id', protect, updateFoodOrder);
router.delete('/:id', protect, deleteFoodOrder);

module.exports = router;
