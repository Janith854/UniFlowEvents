const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true }, // Venue
    organizerName: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Phase 1 Additions
    category: { type: String, enum: ['Academic', 'Social', 'Sports', 'Workshop', 'Cultural', 'Career', 'Tech', 'Music', 'Art', 'Other'], default: 'Other' },
    capacity: { type: Number, required: true, default: -1 }, // -1 = Unlimited
    ticketing: {
        regularPrice: { type: Number, default: 0 },
        vipPrice: { type: Number, default: 0 }
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    image: { type: String }, // Path or URL to uploaded image
    registrationDeadline: { type: Date },
    // Phase 2 Additions
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
