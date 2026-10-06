import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Users,
  Clock,
  User,
  Building2,
  Sparkles,
  CalendarDays,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SmartBadge from '../../components/shared/SmartBadge';
import TimetableUnavailable from '../../components/shared/TimetableUnavailable';
import { useAuth } from '../../context/AuthContext';
import { useTimetable } from '../../hooks/useTimetable';
import { useApi } from '../../hooks/useApi';
import { getClassrooms } from '../../api/classrooms';
import { recordRecentlyViewed } from '../../api/recent';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Venue() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [batch, setBatch] = useState('');

  // Live timetable query for this student's department, year, and selected batch
  const {
    available,
    weeklyTimetable,
    availableBatches,
    loading: ttLoading,
  } = useTimetable(user?.department, user?.year, batch);

  // Auto-select first batch when batches are retrieved
  useEffect(() => {
    if (availableBatches.length && !availableBatches.includes(batch)) {
      setBatch(availableBatches[0]);
    }
  }, [availableBatches, batch]);

  // Fetch all classrooms for this student's department to resolve room facilities & floor
  const { data: classrooms, loading: roomsLoading } = useApi(
    () => (user?.department ? getClassrooms(user.department) : Promise.resolve([])),
    [user?.department]
  );

  // Filter teaching slots for the selected day
  const daySlots = useMemo(() => {
    const slots = weeklyTimetable?.[selectedDay] || [];
    return slots.filter((s) => s.kind === 'course' || s.kind === 'lab' || s.kind === 'elective');
  }, [weeklyTimetable, selectedDay]);

  const currentClass = daySlots[0];

  // Resolve matching classroom document from backend rooms list
  const activeRoom = useMemo(() => {
    if (!currentClass?.venue || !classrooms?.length) return null;
    return (
      classrooms.find((r) => r.id === currentClass.venue) ||
      classrooms.find((r) => currentClass.venue.startsWith(r.id)) ||
      null
    );
  }, [currentClass?.venue, classrooms]);

  // Log to recently viewed history
  useEffect(() => {
    if (currentClass?.venue) {
      recordRecentlyViewed({
        resourceType: 'venue',
        resourceId: activeRoom ? activeRoom.id : currentClass.venue,
        resourceName: `${currentClass.venue} Venue`,
        metadata: {
          department: user?.department,
          course: currentClass.acronym || currentClass.title || currentClass.label,
        },
      }).catch(() => {});
    }
  }, [currentClass?.venue, activeRoom, user?.department]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Compass className="text-brand-600" size={26} /> Classroom Venue & Location
          </h1>
          <Badge tone="brand" className="text-xs">
            {user?.department || 'CSE'}
          </Badge>
        </div>
        <p className="text-ink-500 dark:text-ink-400 text-sm">
          Real-time lecture hall assignments, room facilities, and daily venue sequence for{' '}
          <span className="font-medium text-ink-700 dark:text-ink-200">
            {user?.department} {user?.year}
          </span>.
        </p>
      </div>

      {/* Selectors Bar: Batch and Day */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Day Selection Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DAYS.map((d) => {
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Batch Selection Pills */}
        {availableBatches.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide mr-1">Batch:</span>
            {availableBatches.map((b) => (
              <button
                key={b}
                onClick={() => setBatch(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  batch === b
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                    : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:border-brand-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* When no timetable exists for this department/year */}
      {!available && !ttLoading && (
        <Card className="p-6">
          <TimetableUnavailable department={user?.department} year={user?.year} batch={batch} />
        </Card>
      )}

      {/* Highlight Card: Next / Active Class Venue */}
      {available && currentClass && (
        <Card
          className={`p-6 sm:p-8 transition-all border ${
            activeRoom?.smart
              ? 'border-brand-300 dark:border-brand-700 glow-smart'
              : 'border-ink-200 dark:border-ink-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                <MapPin size={26} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-ink-400 uppercase tracking-wide font-semibold">
                  Scheduled Venue ({selectedDay})
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-ink-50">
                    {currentClass.venue || 'To Be Announced'}
                  </h2>
                  {activeRoom?.smart && <SmartBadge size="md" />}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <Badge tone={currentClass.kind === 'lab' ? 'accent' : 'brand'} className="text-xs uppercase">
                {currentClass.kind || 'Lecture'}
              </Badge>
              <div className="text-xs text-ink-400 font-medium mt-1">
                Period {currentClass.period?.id || '1'}
              </div>
            </div>
          </div>

          <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
            <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-ink-100 mb-1">
              {currentClass.title || currentClass.label || currentClass.acronym}
            </h3>
            {currentClass.code && (
              <span className="inline-block text-xs font-mono font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                Course Code: {currentClass.code}
              </span>
            )}
          </div>

          {/* Location & Schedule Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm mt-5 bg-ink-50/60 dark:bg-ink-850/60 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
              <Building2 size={16} className="text-brand-600 shrink-0" />
              <span>
                {user?.department} Block · {activeRoom?.floor || 'Main Hall'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
              <Users size={16} className="text-slot-600 shrink-0" />
              <span>Capacity: {activeRoom?.capacity ? `${activeRoom.capacity} seats` : '60+ seats'}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300 col-span-2 sm:col-span-1">
              <Clock size={16} className="text-green-600 shrink-0" />
              <span>
                {currentClass.period?.start} – {currentClass.period?.end}
              </span>
            </div>
          </div>

          {/* Assigned Faculty */}
          {currentClass.faculty && currentClass.faculty !== '—' && (
            <p className="flex items-center gap-2 text-xs sm:text-sm text-ink-600 dark:text-ink-300 mt-4">
              <User size={15} className="text-brand-600" />
              <span>Faculty in Charge: <strong className="text-ink-800 dark:text-ink-100">{currentClass.faculty}</strong></span>
            </p>
          )}

          {/* Room Facilities */}
          {activeRoom?.facilities && activeRoom.facilities.length > 0 && (
            <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">
                Venue Equipment & Facilities:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeRoom.facilities.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 flex items-center gap-1"
                  >
                    <CheckCircle2 size={11} className="text-green-600" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State when no classes on this day */}
      {available && daySlots.length === 0 && (
        <Card className="p-8 text-center">
          <EmptyState
            title={`No venue assignments on ${selectedDay}`}
            description={`No classes or laboratory periods are scheduled for ${user?.department} ${user?.year}${batch ? ` Batch ${batch}` : ''} on this day.`}
          />
        </Card>
      )}

      {/* Full Day's Venue Navigation Sequence */}
      {available && daySlots.length > 1 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-ink-800 dark:text-ink-200 flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-600" />
              Complete Venue Sequence for {selectedDay}
            </h3>
            <span className="text-xs text-ink-400">
              {daySlots.length} sessions total
            </span>
          </div>

          <div className="space-y-2">
            {daySlots.map((slot, index) => {
              const isFirst = index === 0;
              return (
                <Card
                  key={slot.id || index}
                  className={`p-3.5 flex items-center justify-between hover:border-brand-300 transition-colors ${
                    isFirst ? 'border-brand-500/40 bg-brand-50/20 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center font-bold text-xs text-brand-600 shrink-0">
                      P{slot.period?.id || (index + 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                          {slot.title || slot.label || slot.acronym}
                        </span>
                        {isFirst && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-brand-600 dark:text-brand-400">
                          <MapPin size={12} /> {slot.venue || 'TBA'}
                        </span>
                        <span>{slot.period?.start} – {slot.period?.end}</span>
                        {slot.faculty && <span>· {slot.faculty}</span>}
                      </div>
                    </div>
                  </div>

                  <Badge tone={slot.kind === 'lab' ? 'accent' : 'brand'} className="text-xs shrink-0">
                    {slot.kind || 'lecture'}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
