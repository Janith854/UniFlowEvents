const Feedback = require('../models/Feedback');

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'name email').populate('event', 'title');
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createFeedback = async (req, res) => {
    try {
        const { message, rating, eventId } = req.body;
        const user = req.user._id;
        const event = eventId;
        
        let sentiment = 'Neutral';
        let aiSuggestedReply = "Thank you for your feedback! We've received your comments and will use them to improve our future events.";

        // Real-time AI Analysis using Gemini 3.1 Pro
        try {
            const { GoogleGenAI } = require('@google/genai');
            const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || 'AI_KEY_NOT_SET');
            const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro" });

            const prompt = `Analyze this student feedback for a university event:
            Message: "${message}"
            Rating: ${rating}/5

            Tasks:
            1. Determine sentiment (Choose exactly one: Positive, Neutral, Negative).
            2. Generate a polite, contextual reply from the Organizer to the student.

            Format the response as a JSON object:
            { "sentiment": "...", "reply": "..." }`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(jsonStr);
            
            sentiment = analysis.sentiment || 'Neutral';
            aiSuggestedReply = analysis.reply || aiSuggestedReply;
        } catch (aiErr) {
            console.warn("Real-time AI analysis failed, using defaults:", aiErr.message);
            // Basic logic for mock fallback
            if (rating >= 4) sentiment = 'Positive';
            else if (rating <= 2) sentiment = 'Negative';
        }

        const feedback = new Feedback({
            user,
            event,
            message,
            rating,
            sentiment,
            aiSuggestedReply
        });

        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
