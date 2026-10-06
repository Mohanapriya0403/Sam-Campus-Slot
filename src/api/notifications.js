import { api } from './client';

export const getNotifications = (department) =>
  api.get(`/notifications${department ? `?department=${encodeURIComponent(department)}` : ''}`);

export const createNotification = (data) => api.post('/notifications', data);

export const deleteNotification = (id) => api.delete(`/notifications/${encodeURIComponent(id)}`);

export const markNotificationRead = (id) => api.patch(`/notifications/${encodeURIComponent(id)}/read`);

export const getVenueChangeNotice = (department, year) =>
  api.get(`/notifications/venue-change?department=${encodeURIComponent(department)}${year ? `&year=${encodeURIComponent(year)}` : ''}`);

export const createVenueChangeNotice = (data) => api.post('/notifications/venue-change', data);
