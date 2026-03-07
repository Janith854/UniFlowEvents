/**
 * Format a date string to a readable format
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

/**
 * Truncate a long string
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 100) => {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Get stored token from localStorage
 */
export const getToken = () => localStorage.getItem('token');
