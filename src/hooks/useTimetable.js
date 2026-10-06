import { useMemo } from 'react';
import { useApi } from './useApi';
import { getTimetable, getTimetableMeta } from '../api/timetable';
import { ApiError } from '../api/client';

const YEAR = 'III Year';
const PERIOD_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Derives the teaching-period column list (id/start/end, no lunch/interval
 * rows since those never appear as timetable_slots rows) straight from
 * whatever slots actually came back — so a department with its own bell
 * schedule (e.g. IT) just works, with no separate per-department constant. */
function derivePeriods(weeklyTimetable) {
  if (!weeklyTimetable) return [];
  const byId = new Map();
  for (const slots of Object.values(weeklyTimetable)) {
    for (const slot of slots) byId.set(slot.period.id, slot.period);
  }
  return PERIOD_ORDER.filter((id) => byId.has(id)).map((id) => byId.get(id));
}

/**
 * Single reusable entry point for "does this department + year + batch have
 * an uploaded timetable, and if so what is it" — now backed by the
 * Express + MongoDB API instead of the static timetableSource.js registry.
 *
 * `batch` may be falsy while a page is still waiting to learn which batches
 * exist (see `availableBatches` below) — the week grid simply isn't fetched
 * until a real batch is known, but `availableBatches`/`semester` still
 * resolve from `year`/`department` alone.
 *
 * No page should ever branch on `department === 'CSE'` directly — they call
 * this hook instead, so adding a new department/year's data later never
 * requires touching a component.
 */
export function useTimetable(department, year, batch) {
  const effectiveYear = year || YEAR;

  const meta = useApi(
    () => (department ? getTimetableMeta(department, effectiveYear) : Promise.resolve({ semester: null, batches: [] })),
    [department, effectiveYear]
  );

  const week = useApi(() => {
    if (!department || !batch) return Promise.resolve(null);
    return getTimetable(department, effectiveYear, batch).catch((err) => {
      // A 404 here just means "nothing uploaded for this combination" — that's
      // an expected, renderable state (TimetableUnavailable), not an error.
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    });
  }, [department, effectiveYear, batch]);

  const weeklyTimetable = week.data || {};
  const days = useMemo(() => Object.keys(weeklyTimetable), [weeklyTimetable]);
  const periods = useMemo(() => derivePeriods(week.data), [week.data]);

  return {
    loading: meta.loading || week.loading,
    error: meta.error || week.error,
    available: !!week.data,
    weeklyTimetable,
    days,
    periods,
    semester: meta.data?.semester || null,
    availableBatches: meta.data?.batches || [],
    departmentYearHasTimetable: (meta.data?.batches?.length || 0) > 0,
  };
}
