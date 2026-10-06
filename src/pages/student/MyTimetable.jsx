import { useState, useEffect } from 'react';
import { LayoutGrid, List, Info, Filter } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import TimetableUnavailable from '../../components/shared/TimetableUnavailable';
import TimetableSlot from '../../components/shared/TimetableSlot';
import { useTimetable } from '../../hooks/useTimetable';
import { useAuth } from '../../context/AuthContext';
import { recordRecentlyViewed } from '../../api/recent';

const DEPARTMENTS = ['CSE', 'IT', 'AIDS', 'MECH', 'ECE', 'CIVIL', 'EEE'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

export default function MyTimetable() {
  const { user } = useAuth();

  // Allow student to browse by department & year, defaulting to their account values
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [year, setYear] = useState(user?.year || 'II Year');
  const [batch, setBatch] = useState('');

  // Keep synced if user profile loads asynchronously
  useEffect(() => {
    if (user?.department) setDepartment(user.department);
    if (user?.year) setYear(user.year);
  }, [user?.department, user?.year]);

  const {
    available,
    weeklyTimetable,
    days: DAYS,
    periods: TEACHING_PERIODS,
    availableBatches,
    loading,
  } = useTimetable(department, year, batch);

  useEffect(() => {
    if (availableBatches.length && !availableBatches.includes(batch)) {
      setBatch(availableBatches[0]);
    }
  }, [availableBatches, batch]);

  useEffect(() => {
    if (department && year && available) {
      recordRecentlyViewed({
        resourceType: 'timetable',
        resourceId: `${department}-${year}`,
        resourceName: `${department} ${year} Timetable`,
        metadata: { department, year, batch },
      }).catch(() => {});
    }
  }, [department, year, available, batch]);

  const [view, setView] = useState('day');
  const [day, setDay] = useState('Monday');
  const classes = weeklyTimetable?.[day] || [];

  if (loading && !batch) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Timetable</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            {department} · {year} · {user?.semester || 'Academic Session'} · AY {user?.academicYear || '2026-2027'}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800 shrink-0">
          <button
            onClick={() => setView('day')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              view === 'day'
                ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600'
                : 'text-ink-400'
            }`}
          >
            <List size={14} /> Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
              view === 'week'
                ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600'
                : 'text-ink-400'
            }`}
          >
            <LayoutGrid size={14} /> Week
          </button>
        </div>
      </div>

      {/* Department, Year & Batch Switcher */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Dept:</span>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setBatch('');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Year:</span>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setBatch('');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {availableBatches.length > 0 && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Batch:</span>
            {availableBatches.map((b) => (
              <button
                key={b}
                onClick={() => setBatch(b)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  batch === b
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-brand-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {!available ? (
        <TimetableUnavailable department={department} year={year} batch={batch} />
      ) : view === 'day' ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  day === d
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {classes.length === 0 ? (
            <EmptyState
              title="No classes scheduled"
              description={`Nothing is on the timetable for ${day}.`}
            />
          ) : (
            <div className="space-y-3">
              {classes.map((slot, i) => (
                <TimetableSlot key={i} slot={slot} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-800">
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-ink-50 dark:bg-ink-800">
                <th className="px-3 py-3 text-left font-semibold text-ink-500 sticky left-0 bg-ink-50 dark:bg-ink-800">
                  Day
                </th>
                {TEACHING_PERIODS.map((p) => (
                  <th
                    key={p.id}
                    className="px-2 py-3 text-center font-semibold text-ink-500 whitespace-nowrap"
                  >
                    {p.start}
                    <br />
                    {p.end}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {DAYS.map((d) => (
                <tr key={d}>
                  <td className="px-3 py-2 font-semibold sticky left-0 bg-white dark:bg-ink-900">
                    {d.slice(0, 3)}
                  </td>
                  {weeklyTimetable[d].map((slot, i) => (
                    <td key={i} className="px-2 py-2 align-top">
                      <div
                        className={`rounded-lg px-2 py-1.5 text-center ${
                          slot.kind === 'elective'
                            ? 'bg-ink-100 dark:bg-ink-800 text-ink-500'
                            : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        }`}
                      >
                        <p className="font-semibold leading-tight">
                          {slot.acronym || slot.label?.split(' ')[0]}
                        </p>
                        {slot.venue && (
                          <p className="text-[10px] text-ink-400 mt-0.5">{slot.venue}</p>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-400 flex items-start gap-1.5">
        <Info size={13} className="mt-0.5 shrink-0" />
        Elective-bank periods list every course in that basket — the source timetable doesn't record each student's individual elective pick.
      </p>
    </div>
  );
}
