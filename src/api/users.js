import { api } from './client';

export const getUsers = () => api.get('/users');

export const updateUser = (id, data) => api.put(`/users/${encodeURIComponent(id)}`, data);

export const deleteUser = (id) => api.delete(`/users/${encodeURIComponent(id)}`);
