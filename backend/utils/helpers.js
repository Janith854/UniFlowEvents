/**
 * Format a date to a readable string
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

/**
 * Generate a success response
 */
const successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};

/**
 * Generate an error response
 */
const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, error: message });
};

module.exports = { formatDate, successResponse, errorResponse };
