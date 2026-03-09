const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};

const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, error: message });
};

module.exports = { formatDate, successResponse, errorResponse };
