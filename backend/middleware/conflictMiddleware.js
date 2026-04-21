const Event = require('../models/Event');

exports.detectConflict = async (req, res, next) => {
    try {
        const { date, location } = req.body;
        if (!date || !location) return next();

        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) return next();

        // Define a 2-hour window (1 hour before and after) to determine conflict
        const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
        const oneHourAfter = new Date(eventDate.getTime() + 60 * 60 * 1000);

        // Case-insensitive location match to catch 'Auditorium' vs 'auditorium'
        const conflictEvent = await Event.findOne({
            location: { $regex: new RegExp(`^${location.trim()}$`, 'i') },
            date: { $gte: oneHourBefore, $lte: oneHourAfter }
        });

        if (conflictEvent) {
            // If we're updating and it's the same event, skip conflict
            if (req.params && req.params.id && conflictEvent._id.toString() === req.params.id) {
                return next();
            }
            return res.status(409).json({ msg: 'Smart Conflict Detection: Another event is already scheduled at this venue at this time.' });
        }

        next();
    } catch (err) {
        console.error('Conflict Middleware Error:', err);
        res.status(500).json({ error: 'Conflict detection error: ' + err.message });
    }
};
