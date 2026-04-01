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
        const feedback = new Feedback(req.body);
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
