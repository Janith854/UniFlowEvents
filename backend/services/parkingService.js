const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const ParkingReservation = require('../models/ParkingReservation');
const Event = require('../models/Event');

/**
 * Handles expiration cleanup and slot availability checks.
 */
exports.cleanupExpiredReservations = async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    await ParkingReservation.deleteMany({
        paymentStatus: 'Pending',
        createdAt: { $lt: fifteenMinutesAgo }
    });
};

/**
 * Logic for initializing a parking reservation session.
 */
exports.initializeReservation = async (studentId, data) => {
    const { eventId, vehiclePlate, zone, slotNumber } = data;

    // 1. One active reservation per event
    const existing = await ParkingReservation.findOne({ event: eventId, student: studentId, paymentStatus: 'Paid' });
    if (existing) throw new Error('You already have an active reservation for this event.');

    // 2. Check if slot is taken
    const taken = await ParkingReservation.findOne({ event: eventId, slotNumber, paymentStatus: 'Paid' });
    if (taken) throw new Error('This slot was just reserved by someone else.');

    // 3. Create Pending reservation
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
                    unit_amount: 100000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/parking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/parking`,
            metadata: { reservationId: reservation._id.toString() }
        });
    } catch (err) {
        console.warn('Stripe fail, mock provided:', err.message);
        const mockId = `MOCK_SESSION_${Date.now()}`;
        session = { id: mockId, url: `${process.env.FRONTEND_URL}/parking/success?session_id=${mockId}` };
    }

    reservation.stripeSessionId = session.id;
    await reservation.save();
    return session;
};

/**
 * Finalizes a reservation after payment confirmation and generates a QR code.
 */
exports.finalizeReservation = async (sessionId) => {
    const reservation = await ParkingReservation.findOne({ stripeSessionId: sessionId });
    if (!reservation) throw new Error('Reservation not found');

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
    return reservation;
};
