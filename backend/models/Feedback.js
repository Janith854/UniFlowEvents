const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    overall: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500 },
    },
    food: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500 },
        notApplicable: { type: Boolean, default: false },
    },
    parking: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 500 },
        notApplicable: { type: Boolean, default: false },
    },
    status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
    averageRating: { type: Number },
    sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative']
    },
    aiSuggestedReply: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

feedbackSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
