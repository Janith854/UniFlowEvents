import API from './api';

export const getAllFeedback = () => API.get('/feedback');
export const getFeedbackStats = () => API.get('/feedback/stats');
export const createFeedback = (data) => API.post('/feedback', data);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
