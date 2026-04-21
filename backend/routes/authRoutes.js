const express = require('express');
const router = express.Router();
const { signup, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── Rate Limiting (requires: npm install express-rate-limit) ─────────────────
let rateLimit;
try {
    rateLimit = require('express-rate-limit');
} catch (_) {
    // If package is not installed, warn and use a pass-through no-op
    console.warn('⚠️  express-rate-limit is not installed. Run: npm install express-rate-limit');
    rateLimit = () => (req, res, next) => next();
}

// Max 10 login/signup attempts per IP per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many attempts from this IP. Please try again after 15 minutes.' },
});

// Looser limiter for forgot-password (5 requests per 15 min)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many password reset requests. Please try again after 15 minutes.' },
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
