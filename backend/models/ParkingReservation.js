const mongoose = require('mongoose');

const parkingReservationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehiclePlate: { type: String, required: true },
    zone: { type: String, required: true, enum: ['North', 'South'] },
    slotNumber: { type: String, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid'], 
        default: 'Pending' 
    },
    qrCodeData: { type: String },
    stripeSessionId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness per event/slot
parkingReservationSchema.index({ event: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingReservation', parkingReservationSchema);
