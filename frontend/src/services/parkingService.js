import API from './api';

export const getParkingStatus = (eventId) => API.get(`/parking/status/${eventId}`);

export const createCheckoutSession = (data) => API.post('/parking/create-checkout-session', data);

export const confirmPayment = (sessionId) => API.post('/parking/confirm-payment', { sessionId });

export const getParkingAnalytics = () => API.get('/parking/analytics');

export const cancelReservation = (id) => API.delete(`/parking/${id}`);
