import { api } from './client';

export const getTimetable = (department, year, batch) =>
  api.get(`/timetable?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}&batch=${encodeURIComponent(batch)}`);

export const getTimetableByDeptYear = (department, year, batch) =>
  api.get(`/timetable/${encodeURIComponent(department)}/${encodeURIComponent(year)}${batch ? `?batch=${encodeURIComponent(batch)}` : ''}`);

export const getTimetableMeta = (department, year) =>
  api.get(`/timetable/meta?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}`);

export const getAvailableTimetables = () => api.get('/timetable/available');

export const createTimetableSlot = (slot) => api.post('/timetable/slot', slot);

export const deleteTimetableSlot = (id) => api.delete(`/timetable/slot/${encodeURIComponent(id)}`);

export const getFacultyTeachingSchedule = (faculty, department) => {
  const params = new URLSearchParams();
  if (faculty) params.append('faculty', faculty);
  if (department) params.append('department', department);
  return api.get(`/timetable/faculty?${params.toString()}`);
};

export const getAdminMasterSchedule = (department, day) => {
  const params = new URLSearchParams();
  if (department) params.append('department', department);
  if (day) params.append('day', day);
  return api.get(`/timetable/admin/matrix?${params.toString()}`);
};
