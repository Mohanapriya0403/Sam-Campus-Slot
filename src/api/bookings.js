import { api } from './client';

export const getMyBookings = (facultyId) => api.get(`/bookings?facultyId=${encodeURIComponent(facultyId)}`);

export const getAllBookings = () => api.get('/bookings');

export const getAvailability = (room, date) => api.get(`/bookings/availability?room=${encodeURIComponent(room)}&date=${encodeURIComponent(date)}`);

export const getDayConflicts = (date) => api.get(`/bookings/day?date=${encodeURIComponent(date)}`);

export const createBooking = (booking) => api.post('/bookings', booking);

export const updateBooking = (id, data) => api.put(`/bookings/${encodeURIComponent(id)}`, data);

export const deleteBooking = (id) => api.delete(`/bookings/${encodeURIComponent(id)}`);

export const cancelBooking = (id) => api.patch(`/bookings/${encodeURIComponent(id)}/cancel`);

export const smartAllocate = (criteria) => api.post('/bookings/smart-allocate', criteria);
