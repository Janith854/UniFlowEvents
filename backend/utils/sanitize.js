/**
 * Returns a safe, serializable representation of a User document.
 * Excludes sensitive fields (password, reset tokens).
 *
 * @param {import('mongoose').Document} user - Mongoose User document
 * @returns {object} Plain sanitized user object
 */
const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    eventsAttended: user.eventsAttended,
    activeVouchers: user.activeVouchers,
    createdAt: user.createdAt,
});

module.exports = { sanitizeUser };
