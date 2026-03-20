const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
});

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Name, email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const allowedRoles = ['student', 'organizer'];
        const normalizedRole = role && allowedRoles.includes(role) ? role : 'student';

        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: normalizedRole,
        });
        await user.save();

        const token = createToken(user);
        res.status(201).json({ msg: 'User registered successfully', token, user: sanitizeUser(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = createToken(user);
        res.json({ msg: 'Login successful', token, user: sanitizeUser(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ user: sanitizeUser(user) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
