import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Users,
  CheckCircle2,
  Building2,
  Sparkles,
  GraduationCap,
  Eye,
  Grid3X3,
  Calendar,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/shared/StatCard';
import TimetableSlot from '../../components/shared/TimetableSlot';
import TimetableUnavailable from '../../components/shared/TimetableUnavailable';
import { useAuth } from '../../context/AuthContext';
import { getFacultyTeachingSchedule, getTimetable, getTimetableMeta } from '../../api/timetable';
import { DEPARTMENTS } from '../../data/cseVenues';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

const STANDARD_PERIODS = [
  { id: '1', start: '08:30', end: '09:20', label: 'P1 (08:30–09:20)' },
  { id: '2', start: '09:15', end: '10:05', label: 'P2 (09:15–10:05)' },
  { id: '3', start: '10:05', end: '10:55', label: 'P3 (10:05–10:55)' },
  { id: '4', start: '11:10', end: '12:00', label: 'P4 (11:10–12:00)' },
  { id: '5', start: '12:00', end: '12:50', label: 'P5 (12:00–12:50)' },
  { id: '6', start: '13:50', end: '14:40', label: 'P6 (13:50–14:40)' },
  { id: '7', start: '14:40', end: '15:30', label: 'P7 (14:40–15:30)' },
];

export default function Timetable() {
  const { user } = useAuth();

  // Faculty filtering
  const [selectedDept, setSelectedDept] = useState(user?.department || 'ALL');
  const [selectedFaculty, setSelectedFaculty] = useState(user?.name || '');
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'matrix' | 'batchExplorer'
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Teaching schedule state
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Batch Explorer state (for auxiliary reference)
  const [explorerYear, setExplorerYear] = useState('III Year');
  const [explorerBatch, setExplorerBatch] = useState('B1');
  const [batchMeta, setBatchMeta] = useState(null);
  const [batchTimetable, setBatchTimetable] = useState(null);

  // Fetch faculty teaching schedule
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    getFacultyTeachingSchedule(selectedFaculty || user?.name || '', selectedDept)
      .then((res) => {
        if (!isCurrent) return;
        setScheduleData(res);
        if (!selectedFaculty && res.faculty) {
          setSelectedFaculty(res.faculty);
        }
      })
      .catch((err) => {
        console.error('Failed to load faculty schedule:', err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedDept, selectedFaculty, user?.name]);

  // Fetch Batch Explorer timetable when that tab is viewed
  useEffect(() => {
    if (activeTab !== 'batchExplorer') return;
    const dept = selectedDept !== 'ALL' ? selectedDept : (user?.department || 'CSE');
    getTimetableMeta(dept, explorerYear)
      .then((meta) => {
        setBatchMeta(meta);
        const batches = meta?.batches || [];
        const activeBatch = batches.includes(explorerBatch) ? explorerBatch : (batches[0] || 'B1');
        setExplorerBatch(activeBatch);
        return getTimetable(dept, explorerYear, activeBatch);
      })
      .then((tt) => setBatchTimetable(tt))
      .catch(() => {
        setBatchMeta(null);
        setBatchTimetable(null);
      });
  }, [activeTab, selectedDept, explorerYear, explorerBatch, user?.department]);

  const weeklySchedule = scheduleData?.weeklySchedule || {};
  const dayClasses = weeklySchedule[selectedDay] || [];
  const distinctFaculties = scheduleData?.distinctFaculties || [];
  const totalSessions = scheduleData?.totalSessions || 0;
  const venues = scheduleData?.venues || [];
  const courses = scheduleData?.courses || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold">Teaching Schedule & Workload</h1>
            <Badge tone="brand" className="text-xs">Faculty Dedicated View</Badge>
          </div>
          <p className="text-ink-500 dark:text-ink-400 text-sm">
            Personal teaching assignments, assigned lecture venues, and weekly laboratory workload for{' '}
            <span className="font-semibold text-ink-700 dark:text-ink-200">
              {scheduleData?.faculty || user?.name || 'Faculty Member'}
            </span>.
          </p>
        </div>

        {/* Department & Faculty Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              label="Department"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedFaculty(''); // Reset faculty to trigger smart match for dept
              }}
            >
              <option value="ALL">All Depts</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>

          {distinctFaculties.length > 0 && (
            <div className="w-56">
              <Select
                label="Faculty Member"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                {distinctFaculties.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Weekly Teaching Hours"
          value={totalSessions}
          suffix=" sessions"
          tone="brand"
        />
        <StatCard
          icon={Clock}
          label={`Sessions on ${selectedDay}`}
          value={dayClasses.length}
          suffix=" classes"
          tone="accent"
        />
        <StatCard
          icon={MapPin}
          label="Assigned Venues"
          value={venues.length}
          suffix=" rooms"
          tone="green"
        />
        <StatCard
          icon={BookOpen}
          label="Courses / Labs Taught"
          value={courses.length}
          suffix=" subjects"
          tone="brand"
        />
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-ink-200 dark:border-ink-800 gap-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'daily'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <Calendar size={16} /> Daily Teaching Schedule
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <Grid3X3 size={16} /> Weekly Workload Matrix
        </button>
        <button
          onClick={() => setActiveTab('batchExplorer')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'batchExplorer'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <GraduationCap size={16} /> Student Batch Explorer
        </button>
      </div>

      {/* TAB 1: Daily Teaching Schedule */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Day selection tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => {
              const count = (weeklySchedule[d] || []).length;
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
                  }`}
                >
                  <span>{d}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-ink-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          {dayClasses.length === 0 ? (
            <Card className="p-8 text-center">
              <EmptyState
                title={`No teaching sessions on ${selectedDay}`}
                description="You have no lectures or laboratory sessions scheduled for this day. Free slot for research, course preparation, or student mentoring."
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {dayClasses.map((slot, i) => (
                <Card key={i} className="p-4 hover:border-brand-300 transition-all border border-ink-200 dark:border-ink-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      {/* Period Badge */}
                      <div className="w-20 text-center shrink-0 py-2 px-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-xl font-bold text-xs">
                        <Clock size={14} className="mx-auto mb-1 text-brand-600 dark:text-brand-400" />
                        <span>{slot.period?.start}</span>
                        <div className="text-[10px] text-ink-400 font-normal mt-0.5">to {slot.period?.end}</div>
                      </div>

                      {/* Course Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-ink-900 dark:text-ink-100 text-base">
                            {slot.title || slot.label || slot.acronym}
                          </h3>
                          {slot.code && (
                            <Badge tone="default" className="text-xs font-mono">
                              {slot.code}
                            </Badge>
                          )}
                          <Badge tone={slot.kind === 'lab' ? 'accent' : 'brand'} className="text-xs capitalize">
                            {slot.kind || 'Lecture'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-ink-500 dark:text-ink-400 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-ink-700 dark:text-ink-300">
                            <MapPin size={13} className="text-brand-600" /> Venue: {slot.venue || 'TBA'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slot-600" /> Target: {slot.department} {slot.year}
                            {slot.batch ? ` (Batch ${slot.batch})` : ''}
                          </span>
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 size={13} /> Confirmed Slot
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <span className="text-xs bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 px-3 py-1 rounded-full font-medium">
                        Period {slot.period?.id || (i + 1)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Weekly Workload Matrix */}
      {activeTab === 'matrix' && (
        <Card className="p-4 overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-ink-700 dark:text-ink-300">
                Weekly Teaching Grid ({scheduleData?.faculty || user?.name})
              </h3>
              <span className="text-xs text-ink-400">
                Total: {totalSessions} teaching periods across {venues.length} venues
              </span>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 text-ink-500">
                  <th className="py-2.5 px-3 text-left font-semibold w-24">Day</th>
                  {STANDARD_PERIODS.map((p) => (
                    <th key={p.id} className="py-2.5 px-2 text-center font-semibold">
                      <div>P{p.id}</div>
                      <div className="text-[10px] text-ink-400 font-normal">{p.start}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {DAYS.map((day) => {
                  const daySlots = weeklySchedule[day] || [];
                  return (
                    <tr key={day} className="hover:bg-ink-50/50 dark:hover:bg-ink-850/50">
                      <td className="py-3 px-3 font-semibold text-ink-700 dark:text-ink-300">{day}</td>
                      {STANDARD_PERIODS.map((p) => {
                        const slot = daySlots.find(
                          (s) => s.period?.id === p.id || s.period?.start === p.start
                        );
                        return (
                          <td key={p.id} className="py-2 px-1 text-center align-top">
                            {slot ? (
                              <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-left">
                                <p className="font-bold text-[11px] text-brand-700 dark:text-brand-300 truncate">
                                  {slot.acronym || slot.title}
                                </p>
                                <p className="text-[10px] text-ink-500 dark:text-ink-400 truncate mt-0.5">
                                  📍 {slot.venue}
                                </p>
                                <p className="text-[9px] text-ink-400 truncate">
                                  {slot.year} {slot.batch ? `(${slot.batch})` : ''}
                                </p>
                              </div>
                            ) : (
                              <div className="py-3 text-[10px] text-ink-300 dark:text-ink-600">— Free —</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Student Batch Explorer */}
      {activeTab === 'batchExplorer' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                  Student Section Cross-Reference
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  Inspect student batch timetables to verify room conflicts or schedule extra sessions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-32">
                  <Select label="Year" value={explorerYear} onChange={(e) => setExplorerYear(e.target.value)}>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>

                {batchMeta?.batches?.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-4">
                    {batchMeta.batches.map((b) => (
                      <button
                        key={b}
                        onClick={() => setExplorerBatch(b)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          explorerBatch === b
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {!batchTimetable ? (
            <TimetableUnavailable
              department={selectedDept !== 'ALL' ? selectedDept : user?.department}
              year={explorerYear}
              batch={explorerBatch}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedDay === d
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-ink-400">
                  {selectedDept !== 'ALL' ? selectedDept : user?.department} · {explorerYear} · Batch {explorerBatch}
                </span>
              </div>

              {(batchTimetable[selectedDay] || []).length === 0 ? (
                <EmptyState
                  title="No classes scheduled"
                  description={`No slots scheduled for ${explorerYear} Batch ${explorerBatch} on ${selectedDay}.`}
                />
              ) : (
                <div className="space-y-3">
                  {(batchTimetable[selectedDay] || []).map((slot, idx) => (
                    <TimetableSlot key={idx} slot={slot} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
