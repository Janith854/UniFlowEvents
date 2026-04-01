const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const ParkingReservation = require('../models/ParkingReservation');
const Event = require('../models/Event');

// Get all reservations for an event to show availability
exports.getParkingStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const reservations = await ParkingReservation.find({ event: eventId, paymentStatus: 'Paid' })
            .select('slotNumber zone');
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
    try {
        const { eventId, vehiclePlate, zone, slotNumber } = req.body;
        const studentId = req.user.id;

        // Constraint: 1 active reservation per event
        const existing = await ParkingReservation.findOne({ 
            event: eventId, 
            student: studentId, 
            paymentStatus: 'Paid' 
        });
        if (existing) {
            return res.status(400).json({ msg: 'You already have an active reservation for this event.' });
        }

        // Check if slot is taken
        const taken = await ParkingReservation.findOne({ 
            event: eventId, 
            slotNumber, 
            paymentStatus: 'Paid' 
        });
        if (taken) {
            return res.status(409).json({ msg: 'This slot was just reserved by someone else.' });
        }

        // Create a Pending reservation
        const reservation = new ParkingReservation({
            event: eventId,
            student: studentId,
            vehiclePlate,
            zone,
            slotNumber,
            paymentStatus: 'Pending'
        });

        let session;
        try {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'lkr',
                        product_data: { name: `Parking Slot ${slotNumber} Reservation` },
                        unit_amount: 100000, // 1000.00 LKR
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parking/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parking`,
                metadata: { reservationId: reservation._id.toString() }
            });
        } catch (stripeErr) {
            console.warn('Stripe Session creation failed, falling back to Mock Payment:', stripeErr.message);
            // Fallback for demo/invalid keys
            const mockId = `MOCK_SESSION_${Date.now()}`;
            session = {
                id: mockId,
                url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parking/success?session_id=${mockId}`
            };
        }

        reservation.stripeSessionId = session.id;
        await reservation.save();

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ msg: 'This slot was just reserved by someone else. Please pick another.' });
        }
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Confirm payment and generate QR code
exports.confirmPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Bypass for Mock Verification
        if (sessionId && sessionId.startsWith('MOCK_SESSION_')) {
            const reservation = await ParkingReservation.findOne({ stripeSessionId: sessionId });
            if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });

            if (reservation.paymentStatus !== 'Paid') {
                reservation.paymentStatus = 'Paid';
                const qrData = JSON.stringify({
                    id: reservation._id,
                    slot: reservation.slotNumber,
                    plate: reservation.vehiclePlate,
                    zone: reservation.zone
                });
                reservation.qrCodeData = await QRCode.toDataURL(qrData);
                await reservation.save();
            }
            return res.json(reservation);
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const reservation = await ParkingReservation.findOne({ stripeSessionId: sessionId });
            if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });

            if (reservation.paymentStatus !== 'Paid') {
                reservation.paymentStatus = 'Paid';
                
                // Generate QR Code Data
                const qrData = JSON.stringify({
                    id: reservation._id,
                    slot: reservation.slotNumber,
                    plate: reservation.vehiclePlate,
                    zone: reservation.zone
                });
                reservation.qrCodeData = await QRCode.toDataURL(qrData);
                await reservation.save();
            }

            res.json(reservation);
        } else {
            res.status(400).json({ msg: 'Payment not completed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Parking Analytics for Organizers
exports.getParkingAnalytics = async (req, res) => {
    try {
        const stats = await ParkingReservation.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: '$zone', count: { $sum: 1 } } }
        ]);
        
        const north = stats.find(s => s._id === 'North')?.count || 0;
        const south = stats.find(s => s._id === 'South')?.count || 0;

        res.json([
            { name: 'North Zone', value: north },
            { name: 'South Zone', value: south }
        ]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cancel reservation (Refund logic can be complex, so we just invalidate for now)
exports.cancelParkingReservation = async (req, res) => {
    try {
        const reservation = await ParkingReservation.findById(req.params.id).populate('event');
        if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });

        // Check deadline
        const eventDate = new Date(reservation.event.date);
        if (new Date() > eventDate) {
            return res.status(400).json({ msg: 'Cannot cancel after the event has started.' });
        }

        await ParkingReservation.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Reservation cancelled successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

