const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

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
