import API from './api';

export const getEvents = () => API.get('/events');
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' }});
export const updateEvent = (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const generateTicket = (id) => API.post(`/events/${id}/ticket`);
export const updateEventStatus = (id, status) => API.patch(`/events/${id}/status`, { status });
export const inviteUsers = (id, emails) => API.post(`/events/${id}/invite`, { emails });
export const analyzeEventFeedback = (id) => API.get(`/events/${id}/analyze`);
export const checkOrganizerConflict = (date) => API.get(`/events/check-conflict`, { params: { date } });
