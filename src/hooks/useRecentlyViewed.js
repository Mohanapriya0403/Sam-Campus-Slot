import { useState, useEffect, useCallback } from 'react';
import { getRecentlyViewed, recordRecentlyViewed, clearRecentlyViewed } from '../api/recent';

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecentlyViewed();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const recordView = useCallback(
    async ({ resourceType = 'classroom', resourceId, resourceName, metadata = {} }) => {
      try {
        await recordRecentlyViewed({ resourceType, resourceId, resourceName, metadata });
        fetchItems();
      } catch (err) {
        console.warn('Failed to record recent view:', err.message);
      }
    },
    [fetchItems]
  );

  const clearAll = useCallback(async () => {
    try {
      await clearRecentlyViewed();
      setItems([]);
    } catch (err) {
      console.warn('Failed to clear recent views:', err.message);
    }
  }, []);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    recordView,
    clearAll,
  };
}
