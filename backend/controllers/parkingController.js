const Parking = require('../models/Parking');

exports.getParkingReservations = async (req, res) => {
    try {
        const reservations = await Parking.find().populate('user', 'name email').populate('event', 'title');
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createParkingReservation = async (req, res) => {
    try {
        const reservation = new Parking(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateParkingReservation = async (req, res) => {
    try {
        const reservation = await Parking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reservation) return res.status(404).json({ msg: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteParkingReservation = async (req, res) => {
    try {
        await Parking.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Parking reservation deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
