import { api } from './client';

export const getAnalytics = () => api.get('/analytics');
