/**
 * Middleware to validate required fields in the request body.
 * Usage: router.post('/path', validate(['field1', 'field2']), controller)
 */
exports.validate = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim()));
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                msg: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields 
            });
        }
        next();
    };
};

/**
 * Validates email format.
 */
exports.isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
