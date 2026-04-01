const express = require('express');
const cors = require('cors');

const app = express();

const path = require('path');

app.use(express.json());
app.use(cors());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));

app.get('/', (req, res) => {
    res.send('UniFlowEvents API is running...');
});

module.exports = app;
