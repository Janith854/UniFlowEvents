const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// ── Security: Restrict CORS to known frontend origins only ──────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Security: Strip MongoDB operators ($where, $gt, etc.) from user input ───
// Prevents NoSQL injection attacks where an attacker sends { "email": { "$gt": "" } }
app.use(mongoSanitize());

// ── Static files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));

app.get('/', (req, res) => {
    res.send('UniFlowEvents API is running...');
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Catches errors thrown by middleware and routes that call next(err)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[Error] ${req.method} ${req.path} →`, err.message);
    res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
