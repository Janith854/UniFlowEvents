import API from './api';

export const getMyProfile = () => API.get('/users/me');
export const updateMyProfile = (data) => API.put('/users/me', data);
export const getAllUsers = () => API.get('/users');
export const createUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
