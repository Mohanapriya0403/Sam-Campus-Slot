import { api } from './client';

export const getClassrooms = (department) => api.get(`/classrooms${department ? `?department=${encodeURIComponent(department)}` : ''}`);

export const getClassroomsGrouped = (department) => api.get(`/classrooms/grouped?department=${encodeURIComponent(department)}`);

export const getClassroomById = (id) => api.get(`/classrooms/${encodeURIComponent(id)}`);

export const createClassroom = (room) => api.post('/classrooms', room);

export const updateClassroom = (id, data) => api.put(`/classrooms/${encodeURIComponent(id)}`, data);

export const deleteClassroom = (id) => api.delete(`/classrooms/${encodeURIComponent(id)}`);

export const setClassroomStatus = (id, status) => api.patch(`/classrooms/${encodeURIComponent(id)}/status`, { status });
