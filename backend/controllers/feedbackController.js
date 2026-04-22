const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const User = require('../models/User');

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const toTrimmedString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

const buildPayload = (body) => {
    const overallComment = toTrimmedString(body.overallComment);
    const foodComment = toTrimmedString(body.foodComment);
    const parkingComment = toTrimmedString(body.parkingComment);

    return {
        overall: {
            rating: toNumber(body.overallRating),
            comment: overallComment
        },
        food: {
            rating: toNumber(body.foodRating),
            comment: foodComment,
            notApplicable: Boolean(body.foodNotApplicable)
        },
        parking: {
            rating: toNumber(body.parkingRating),
            comment: parkingComment,
            notApplicable: Boolean(body.parkingNotApplicable)
        }
    };
};

const validateSubmitted = (payload) => {
    const errors = [];

    if (!payload.overall.rating || payload.overall.rating < 1 || payload.overall.rating > 5) {
        errors.push('Overall rating is required and must be between 1 and 5.');
    }

    if (!payload.food.notApplicable) {
        if (!payload.food.rating || payload.food.rating < 1 || payload.food.rating > 5) {
            errors.push('Food rating is required or mark it as not applicable.');
        }
    }

    if (!payload.parking.notApplicable) {
        if (!payload.parking.rating || payload.parking.rating < 1 || payload.parking.rating > 5) {
            errors.push('Parking rating is required or mark it as not applicable.');
        }
    }

    if (payload.overall.comment.length > 500 || payload.food.comment.length > 500 || payload.parking.comment.length > 500) {
        errors.push('Comments must be 500 characters or fewer.');
    }

    return errors;
};

const computeAverage = (payload) => {
    const ratings = [];

    if (payload.overall.rating) ratings.push(payload.overall.rating);
    if (!payload.food.notApplicable && payload.food.rating) ratings.push(payload.food.rating);
    if (!payload.parking.notApplicable && payload.parking.rating) ratings.push(payload.parking.rating);

    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, value) => acc + value, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
};

const getReplyMessage = (averageRating) => {
    if (averageRating >= 4) {
        return 'Thank you so much for the amazing feedback. We are glad you enjoyed the event and appreciate your support.';
    }
    return 'Thank you for your honest feedback. We are sorry some parts did not meet expectations and will review your comments to improve the next event.';
};

const getSentiment = (averageRating) => {
    if (averageRating >= 4) return 'Positive';
    if (averageRating <= 3) return 'Negative';
    return 'Neutral';
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ status: 'submitted' })
            .populate('user', 'name email')
            .populate('event', 'title')
            .sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ msg: 'Feedback already submitted for this event.' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.createFeedback = async (req, res) => {
    try {
        const { eventId, status } = req.body;
        const user = req.user._id;

        if (!eventId) {
            return res.status(400).json({ msg: 'Event is required.' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found.' });
        }

        const nextStatus = status === 'draft' ? 'draft' : 'submitted';
        const payload = buildPayload(req.body);

        if (nextStatus === 'submitted') {
            const errors = validateSubmitted(payload);
            if (errors.length > 0) {
                return res.status(400).json({ msg: errors.join(' ') });
            }
        }

        const existing = await Feedback.findOne({ user, event: eventId });
        if (existing && existing.status === 'submitted' && nextStatus === 'submitted') {
            return res.status(409).json({ msg: 'Feedback already submitted for this event.' });
        }
        if (existing && existing.status === 'submitted' && nextStatus === 'draft') {
            return res.status(409).json({ msg: 'Feedback already submitted for this event.' });
        }

        const averageRating = nextStatus === 'submitted' ? computeAverage(payload) : null;
        const sentiment = nextStatus === 'submitted' ? getSentiment(averageRating || 0) : undefined;
        const aiSuggestedReply = nextStatus === 'submitted' ? getReplyMessage(averageRating || 0) : undefined;

        const feedbackPayload = {
            user,
            event: eventId,
            overall: payload.overall,
            food: payload.food,
            parking: payload.parking,
            status: nextStatus,
            averageRating,
            sentiment,
            aiSuggestedReply,
            updatedAt: new Date()
        };

        let feedback;
        if (existing) {
            feedback = await Feedback.findByIdAndUpdate(existing._id, feedbackPayload, {
                new: true,
                runValidators: true
            });
        } else {
            feedback = new Feedback(feedbackPayload);
            await feedback.save();
        }

        if (nextStatus === 'submitted') {
            await User.findByIdAndUpdate(user, {
                $push: {
                    inbox: {
                        type: 'feedback-reply',
                        title: `Feedback response for ${event.title}`,
                        message: aiSuggestedReply,
                        event: event._id
                    }
                }
            });
        }

        res.status(201).json({
            feedback,
            replyMessage: nextStatus === 'submitted' ? aiSuggestedReply : null,
            status: nextStatus
        });
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

exports.getFeedbackStats = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'submitted' });
        
        const totalFeedback = feedbacks.length;
        let averageRating = 0;

        if (totalFeedback > 0) {
            const sum = feedbacks.reduce((acc, f) => acc + (f.averageRating || 0), 0);
            averageRating = Math.round((sum / totalFeedback) * 10) / 10;
        }

        const satisfaction = {
            positive: feedbacks.filter(f => f.sentiment === 'Positive').length,
            neutral: feedbacks.filter(f => f.sentiment === 'Neutral').length,
            negative: feedbacks.filter(f => f.sentiment === 'Negative').length
        };

        const complaintKeywords = [
            'slow', 'cold', 'expensive', 'crowded', 'parking', 'food', 'late', 'rude', 
            'unorganized', 'loud', 'hot', 'dark', 'small', 'dirty', 'missing', 'wait',
            'expensive', 'confusing', 'boring'
        ];
        const complaintsMap = {};

        feedbacks.forEach(f => {
            const allComments = [
                f.overall?.comment || '',
                f.food?.comment || '',
                f.parking?.comment || ''
            ].join(' ').toLowerCase();

            complaintKeywords.forEach(keyword => {
                if (allComments.includes(keyword)) {
                    complaintsMap[keyword] = (complaintsMap[keyword] || 0) + 1;
                }
            });
        });

        const commonComplaints = Object.entries(complaintsMap)
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            averageRating,
            totalFeedback,
            satisfaction,
            commonComplaints
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
