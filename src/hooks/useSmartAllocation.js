import { useState, useCallback } from 'react';
import { smartAllocate, createBooking, getDayConflicts } from '../api/bookings';
import { getClassrooms } from '../api/classrooms';
import { rankRooms } from '../utils/allocation';
import { recordRecentlyViewed } from '../api/recent';

export function useSmartAllocation() {
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState(null);

  const findAllocation = useCallback(async (form) => {
    setLoading(true);
    setError(null);
    setConflict(null);

    try {
      // 1. Try server-side smart allocation endpoint
      const serverRes = await smartAllocate({
        date: form.date,
        start: form.start,
        end: form.end,
        studentCount: Number(form.students),
        department: form.department,
        facilities: form.facilities,
        smartRequired: form.smartRequired,
        crossDept: form.crossDept,
      });

      if (serverRes?.best) {
        setResults(serverRes);
        // Record smart allocation access in RecentlyViewed
        recordRecentlyViewed({
          resourceType: 'allocation',
          resourceId: 'smart-allocation',
          resourceName: 'Smart Allocation',
          metadata: {
            date: form.date,
            start: form.start,
            end: form.end,
            department: form.department,
          },
        }).catch(() => {});
        return serverRes;
      }
    } catch {
      // Fallback: calculate client-side using live database queries
      try {
        const [rooms, dayConflicts] = await Promise.all([
          getClassrooms(form.crossDept ? undefined : form.department),
          getDayConflicts(form.date),
        ]);

        const criteria = {
          studentCount: Number(form.students),
          facilities: form.facilities || [],
          start: form.start,
          end: form.end,
          smartRequired: form.smartRequired,
          conflicts: dayConflicts || [],
          department: form.department,
        };

        const eligible = (rooms || []).filter((r) => r.status !== 'maintenance' && r.status !== 'blocked');
        const ranked = rankRooms(eligible, criteria);

        const fallbackRes = {
          best: ranked[0] || null,
          alternatives: ranked.slice(1, 5),
          allRanked: ranked,
        };
        setResults(fallbackRes);
        return fallbackRes;
      } catch (clientErr) {
        setError(clientErr.message || 'Failed to calculate allocation.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const bookRoom = useCallback(async (roomResult, formDetails) => {
    setBookingLoading(true);
    setConflict(null);
    try {
      const newBooking = await createBooking({
        room: roomResult.room.id,
        date: formDetails.date,
        start: formDetails.start,
        end: formDetails.end,
        purpose: formDetails.purpose || `${formDetails.classType || 'Class'} — ${formDetails.department || 'CSE'}`,
        studentCount: formDetails.students,
        facilities: formDetails.facilities,
        smartRequired: formDetails.smartRequired,
      });

      // Record booking in RecentlyViewed
      recordRecentlyViewed({
        resourceType: 'booking',
        resourceId: newBooking.id,
        resourceName: `${roomResult.room.id} Booking (${formDetails.date})`,
        metadata: {
          room: roomResult.room.id,
          date: formDetails.date,
          start: formDetails.start,
          end: formDetails.end,
        },
      }).catch(() => {});

      return { ok: true, booking: newBooking };
    } catch (err) {
      setConflict({
        room: roomResult.room,
        message: err.message,
        alternatives: err.alternatives || results?.alternatives || [],
      });
      return { ok: false, error: err.message, alternatives: err.alternatives };
    } finally {
      setBookingLoading(false);
    }
  }, [results]);

  return {
    findAllocation,
    bookRoom,
    results,
    best: results?.best || null,
    alternatives: results?.alternatives || [],
    loading,
    bookingLoading,
    conflict,
    error,
    clearResults: () => {
      setResults(null);
      setConflict(null);
    },
  };
}
