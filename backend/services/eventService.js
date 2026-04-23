const Event = require('../models/Event');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const crypto = require('crypto');

/**
 * Handles logic for registering a user to an event and generating a ticket.
 * Manages reward logic (e.g., vouchers after 5 events).
 */
exports.registerForEvent = async (eventId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const alreadyRegistered = event.participants.some(
        (p) => p.toString() === user._id.toString()
    );

    if (alreadyRegistered) {
        return {
            msg: 'Already registered',
            ticketId: generateTicketId(),
            rewardIssued: false,
            eventsAttended: user.eventsAttended
        };
    }

    // New registration
    event.participants.push(user._id);
    await event.save();

    user.eventsAttended += 1;
    let rewardIssued = false;
    if (user.eventsAttended % 5 === 0) {
        user.activeVouchers.push('5_EVENT_SNACK_REWARD');
        rewardIssued = true;
    }
    await user.save();

    return {
        msg: 'Registration successful',
        ticketId: generateTicketId(),
        eventsAttended: user.eventsAttended,
        rewardIssued
    };
};

/**
 * Analyzes event feedback using Gemini AI or falls back to mock suggestions.
 */
exports.analyzeFeedback = async (eventId) => {
    const feedbacks = await Feedback.find({ event: eventId });
    if (!feedbacks || feedbacks.length === 0) {
        return ["Not enough feedback data.", "Encourage more participants to leave reviews.", "Wait for more data before analysis."];
    }

    const feedbackMessages = feedbacks.map(f => `Rating: ${f.rating}/5 - ${f.message}`).join("\n");
    const prompt = `Analyze feedback for this event and provide 3 actionable suggestions as a JSON array of strings: \n${feedbackMessages}`;

    try {
        const { GoogleGenAI } = require('@google/genai');
        if (!process.env.GEMINI_API_KEY) throw new Error('No API Key');
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash', 
            contents: prompt,
        });
        
        const textResponse = result.text;
        const jsonStr = textResponse.replace(/^```json/m, '').replace(/```$/m, '');
        return JSON.parse(jsonStr);
    } catch (err) {
        return [
            "Maintain current standard of air conditioning based on user feedback.",
            "Consider expanding VIP seating options for high-demand event types.",
            "Streamline registration desk flow for future large-scale events."
        ];
    }
};

const generateTicketId = () => 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
