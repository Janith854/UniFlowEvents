import API from './api';

export const getAllFeedback = () => API.get('/feedback');
export const getMyFeedback = () => API.get('/feedback/my');
export const createFeedback = (data) => API.post('/feedback', data);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
export const replyToFeedback = (id, message) => API.post(`/feedback/${id}/reply`, { message });
