import API from './api';

export const getAllFeedback = () => API.get('/feedback');
export const createFeedback = (data) => API.post('/feedback', data);
export const deleteFeedback = (id) => API.delete(`/feedback/${id}`);
