const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ParkingSchema = new mongoose.Schema({
    eventId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    vehiclePlate: String,
    zone: String,
    slotNumber: String,
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    stripeSessionId: String,
    qrCodeData: String
});

const ParkingReservation = mongoose.model('ParkingReservation', ParkingSchema);
const User = mongoose.model('User', new mongoose.Schema({ email: String }));
const Event = mongoose.model('Event', new mongoose.Schema({ title: String }));

async function seed() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniflow_events');
    const user = await User.findOne({ email: 'admin@university.edu' });
    const event = await Event.findOne({});

    if (!user || !event) {
        console.error('User or Event not found. Please ensure the app has been seeded with events and users.');
        process.exit(1);
    }

    const sessionId = 'MOCK_SESSION_123';
    
    // Check if exists
    let res = await ParkingReservation.findOne({ stripeSessionId: sessionId });
    if (!res) {
        const qrData = JSON.stringify({
            id: 'mock_id',
            slot: 'N1',
            plate: 'WP ABC-1234',
            zone: 'North'
        });
        const qrCodeData = await QRCode.toDataURL(qrData);

        res = new ParkingReservation({
            eventId: event._id,
            studentId: user._id,
            vehiclePlate: 'WP ABC-1234',
            zone: 'North',
            slotNumber: 'N1',
            paymentStatus: 'Paid',
            stripeSessionId: sessionId,
            qrCodeData
        });
        await res.save();
        console.log('Mock reservation created with session_id:', sessionId);
    } else {
        console.log('Mock reservation already exists');
    }
    process.exit();
}

seed();
