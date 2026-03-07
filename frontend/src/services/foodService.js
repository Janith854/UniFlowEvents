import API from './api';

export const getFoodOrders = () => API.get('/food');
export const createFoodOrder = (data) => API.post('/food', data);
export const updateFoodOrder = (id, data) => API.put(`/food/${id}`, data);
export const deleteFoodOrder = (id) => API.delete(`/food/${id}`);
