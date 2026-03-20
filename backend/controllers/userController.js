const User = require('../models/User');

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
});

const canManageUser = (requestUser, targetUserId) => {
    return requestUser.role === 'organizer' || requestUser._id.toString() === targetUserId.toString();
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users.map((user) => sanitizeUser(user)));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        if (!canManageUser(req.user, req.params.id)) {
            return res.status(403).json({ msg: 'Not authorized to view this profile' });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        if (!canManageUser(req.user, req.params.id)) {
            return res.status(403).json({ msg: 'Not authorized to update this profile' });
        }

        const allowedFields = ['name', 'email'];
        if (req.user.role === 'organizer') {
            allowedFields.push('role');
        }

        const updatePayload = {};
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updatePayload[field] = req.body[field];
            }
        }

        if (updatePayload.email) {
            updatePayload.email = String(updatePayload.email).toLowerCase().trim();

            const emailTaken = await User.findOne({
                email: updatePayload.email,
                _id: { $ne: req.params.id },
            });

            if (emailTaken) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
        }

        if (updatePayload.role && !['student', 'organizer'].includes(updatePayload.role)) {
            return res.status(400).json({ msg: 'Invalid role provided' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, updatePayload, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (!canManageUser(req.user, req.params.id)) {
            return res.status(403).json({ msg: 'Not authorized to delete this account' });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ msg: 'User not found' });

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const updatePayload = {};

        if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
            updatePayload.name = req.body.name;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
            updatePayload.email = String(req.body.email).toLowerCase().trim();
            const emailTaken = await User.findOne({
                email: updatePayload.email,
                _id: { $ne: req.user._id },
            });

            if (emailTaken) {
                return res.status(400).json({ msg: 'Email is already in use' });
            }
        }

        const user = await User.findByIdAndUpdate(req.user._id, updatePayload, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(sanitizeUser(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
