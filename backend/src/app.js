const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

app.get('/', (req, res) => {
    res.send('UniFlowEvents API is running...');
});

module.exports = app;
