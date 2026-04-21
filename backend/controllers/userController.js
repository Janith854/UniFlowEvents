const User = require('../models/User');
const { sanitizeUser } = require('../utils/sanitize');

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

exports.deactivateUser = async (req, res) => {
    try {
        if (!canManageUser(req.user, req.params.id)) {
            return res.status(403).json({ msg: 'Not authorized to deactivate this account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isActive = false;
        await user.save();

        res.json({ msg: 'User deactivated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase().trim() });

        // Always return the same generic response to prevent user enumeration
        const genericResponse = { msg: 'If that email is registered, a password reset link has been sent.' };

        if (!user) {
            return res.json(genericResponse);
        }

        const resetToken = require('crypto').randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        const emailService = require('../services/emailService');
        const previewUrl = await emailService.sendPasswordResetEmail(user.email, resetToken);

        res.json({ ...genericResponse, previewUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ msg: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
