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
const multer = require('multer');
const path = require('path');

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  res.json({ path: `/uploads/${req.file.filename}` });
});

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
