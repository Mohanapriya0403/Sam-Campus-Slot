import { api } from './client';

export const logRecentView = (roomId) => api.post('/recent', { resourceType: 'classroom', resourceId: roomId, roomId });

export const recordRecentlyViewed = ({ resourceType = 'classroom', resourceId, resourceName, metadata = {} }) =>
  api.post('/recent', { resourceType, resourceId, resourceName, metadata });

export const getRecentlyViewed = () => api.get('/recent');

export const clearRecentlyViewed = () => api.delete('/recent');
