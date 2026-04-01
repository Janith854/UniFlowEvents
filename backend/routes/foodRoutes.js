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

router.post('/lock', addCartLock);
router.delete('/lock', removeCartLock);
router.get('/', getFoodOrders);
router.post('/', protect, createFoodOrder);
router.put('/:id', protect, updateFoodOrder);
router.delete('/:id', protect, deleteFoodOrder);

module.exports = router;
