const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    slotNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    status: { type: String, enum: ['reserved', 'available', 'cancelled'], default: 'reserved' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Parking', parkingSchema);
