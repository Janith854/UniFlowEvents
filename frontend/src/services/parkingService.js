import API from './api';

export const getParkingReservations = () => API.get('/parking');
export const createParkingReservation = (data) => API.post('/parking', data);
export const updateParkingReservation = (id, data) => API.put(`/parking/${id}`, data);
export const deleteParkingReservation = (id) => API.delete(`/parking/${id}`);
