import API from './api';

export const getMenu = () => API.get('/food/menu');
export const addCartLock = (data) => API.post('/food/lock', data);
export const removeCartLock = (data) => API.delete('/food/lock', { data });

export const getFoodOrders = () => API.get('/food');
export const createFoodOrder = (data) => API.post('/food', data);
export const confirmPayment = (data) => API.post('/food/confirm-payment', data);
export const updateFoodOrder = (id, data) => API.put(`/food/${id}`, data);
export const deleteFoodOrder = (id) => API.delete(`/food/${id}`);
