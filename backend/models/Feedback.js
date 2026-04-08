const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    sentiment: { 
        type: String, 
        enum: ['Positive', 'Neutral', 'Negative'] 
    },
    aiSuggestedReply: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
