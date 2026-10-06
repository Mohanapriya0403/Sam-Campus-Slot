import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Building2,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Search,
  Filter,
  Grid3X3,
  Layers,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import StatCard from '../../components/shared/StatCard';
import TimetableSlot from '../../components/shared/TimetableSlot';
import TimetableUnavailable from '../../components/shared/TimetableUnavailable';
import { DEPARTMENTS } from '../../data/cseVenues';
import { getAdminMasterSchedule, getTimetableMeta, getTimetable } from '../../api/timetable';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

export default function AdminTimetable() {
  const [department, setDepartment] = useState('CSE');
  const [day, setDay] = useState('Monday');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'batchInspector' | 'facultyRoster'
  const [venueSearch, setVenueSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'occupied' | 'free'

  // Master schedule matrix state
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Batch inspector state
  const [inspectorYear, setInspectorYear] = useState('III Year');
  const [inspectorBatch, setInspectorBatch] = useState('B1');
  const [batchMeta, setBatchMeta] = useState(null);
  const [batchTimetable, setBatchTimetable] = useState(null);

  // Fetch Master Schedule matrix
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    getAdminMasterSchedule(department, day)
      .then((res) => {
        if (isCurrent) setMatrixData(res);
      })
      .catch((err) => {
        console.error('Failed to load admin matrix:', err);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [department, day]);

  // Fetch Batch Timetable for inspector tab
  useEffect(() => {
    if (activeTab !== 'batchInspector') return;
    getTimetableMeta(department, inspectorYear)
      .then((meta) => {
        setBatchMeta(meta);
        const batches = meta?.batches || [];
        const activeBatch = batches.includes(inspectorBatch) ? inspectorBatch : (batches[0] || 'B1');
        setInspectorBatch(activeBatch);
        return getTimetable(department, inspectorYear, activeBatch);
      })
      .then((tt) => setBatchTimetable(tt))
      .catch(() => {
        setBatchMeta(null);
        setBatchTimetable(null);
      });
  }, [activeTab, department, inspectorYear, inspectorBatch]);

  const standardPeriods = matrixData?.standardPeriods || [];
  const matrix = matrixData?.matrix || [];
  const venuesCount = matrixData?.venuesCount || 0;
  const activeSlotsToday = matrixData?.activeSlotsToday || 0;
  const occupiedCount = matrixData?.occupiedCount || 0;
  const facultyOnDutyCount = matrixData?.facultyOnDutyCount || 0;

  // Filter matrix rows by search query and occupancy status
  const filteredMatrix = useMemo(() => {
    return matrix.filter((row) => {
      const matchesSearch = row.venue.toLowerCase().includes(venueSearch.toLowerCase().trim());
      if (!matchesSearch) return false;

      const hasOccupancy = Object.values(row.periods).some(Boolean);
      if (statusFilter === 'occupied') return hasOccupancy;
      if (statusFilter === 'free') return !hasOccupancy;
      return true;
    });
  }, [matrix, venueSearch, statusFilter]);

  // Aggregate faculty duty roster for selected department and day
  const facultyRoster = useMemo(() => {
    const map = new Map();
    for (const row of matrix) {
      for (const [periodId, slot] of Object.entries(row.periods)) {
        if (slot?.faculty && slot.faculty !== '—') {
          const key = slot.faculty;
          if (!map.has(key)) {
            map.set(key, { faculty: key, sessions: [] });
          }
          map.get(key).sessions.push({
            periodId,
            period: slot.period,
            course: slot.title,
            code: slot.code,
            venue: row.venue,
            batch: slot.batch,
            year: slot.year,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.sessions.length - a.sessions.length);
  }, [matrix]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="text-brand-600" size={26} /> Institutional Master Schedule
            </h1>
            <Badge tone="brand" className="text-xs">Administrator Control</Badge>
          </div>
          <p className="text-ink-500 dark:text-ink-400 text-sm">
            Campus-wide room occupancy matrix, departmental venue utilization, and active faculty duty allocations.
          </p>
        </div>

        {/* Department & Day Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              label="Department"
              icon={Building2}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>

          <div className="w-40">
            <Select
              label="Schedule Day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label={`${department} Campus Venues`}
          value={venuesCount}
          suffix=" rooms"
          tone="brand"
        />
        <StatCard
          icon={Clock}
          label={`Active Periods Today (${day})`}
          value={activeSlotsToday}
          suffix=" sessions"
          tone="accent"
        />
        <StatCard
          icon={MapPin}
          label="Occupied Venue Slots"
          value={occupiedCount}
          suffix=" slots"
          tone="green"
        />
        <StatCard
          icon={Users}
          label="Faculty on Duty Today"
          value={facultyOnDutyCount}
          suffix=" faculty"
          tone="brand"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-ink-200 dark:border-ink-800 gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <Grid3X3 size={16} /> Room Occupancy Matrix (Master View)
        </button>
        <button
          onClick={() => setActiveTab('facultyRoster')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'facultyRoster'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <Users size={16} /> Faculty Duty Roster ({facultyRoster.length})
        </button>
        <button
          onClick={() => setActiveTab('batchInspector')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'batchInspector'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <GraduationCap size={16} /> Student Batch Inspector
        </button>
      </div>

      {/* TAB 1: Room Occupancy Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Filter hall or lab (e.g. F12, ICL)..."
                  value={venueSearch}
                  onChange={(e) => setVenueSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-ink-500 font-medium">Filter:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  All ({matrix.length})
                </button>
                <button
                  onClick={() => setStatusFilter('occupied')}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    statusFilter === 'occupied'
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  Occupied
                </button>
                <button
                  onClick={() => setStatusFilter('free')}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                    statusFilter === 'free'
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}
                >
                  Available All Day
                </button>
              </div>
            </div>
          </Card>

          {/* 2D Master Matrix Table */}
          <Card className="p-4 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                    {department} Department — {day} Master Schedule Matrix
                  </h3>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Showing {filteredMatrix.length} of {matrix.length} venues across 7 daily academic periods.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-brand-100 dark:bg-brand-950 border border-brand-300 dark:border-brand-700" />
                    <span>Occupied</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-ink-50 dark:bg-ink-850 border border-ink-200 dark:border-ink-800" />
                    <span className="text-ink-400">Available</span>
                  </span>
                </div>
              </div>

              {filteredMatrix.length === 0 ? (
                <EmptyState
                  title="No venues match filter"
                  description="Try adjusting your search query or status filter."
                />
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink-200 dark:border-ink-800 text-ink-500">
                      <th className="py-2.5 px-3 text-left font-semibold w-28">Hall / Lab</th>
                      {standardPeriods.map((p) => (
                        <th key={p.id} className="py-2.5 px-2 text-center font-semibold">
                          <div>P{p.id}</div>
                          <div className="text-[10px] text-ink-400 font-normal">{p.start}–{p.end}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                    {filteredMatrix.map((row) => {
                      return (
                        <tr key={row.venue} className="hover:bg-ink-50/50 dark:hover:bg-ink-850/50">
                          <td className="py-3 px-3 font-bold text-ink-800 dark:text-ink-200">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-brand-600" />
                              <span>{row.venue}</span>
                            </div>
                          </td>
                          {standardPeriods.map((p) => {
                            const slot = row.periods[p.id];
                            return (
                              <td key={p.id} className="py-1.5 px-1 text-center align-top">
                                {slot ? (
                                  <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-left">
                                    <p className="font-bold text-[11px] text-brand-700 dark:text-brand-300 truncate">
                                      {slot.title || slot.code}
                                    </p>
                                    <p className="text-[10px] text-ink-600 dark:text-ink-300 truncate mt-0.5">
                                      👥 {slot.year} {slot.batch ? `(${slot.batch})` : ''}
                                    </p>
                                    <p className="text-[9px] text-ink-400 truncate mt-0.5">
                                      👤 {slot.faculty || 'Faculty'}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="py-3 text-[10px] text-green-600 dark:text-green-400 font-medium">
                                    Free
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Faculty Duty Roster */}
      {activeTab === 'facultyRoster' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">
              {department} Faculty Duty Roster on {day}
            </h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Overview of teaching faculty members, active periods, and assigned venues for today.
            </p>
          </Card>

          {facultyRoster.length === 0 ? (
            <Card className="p-8 text-center">
              <EmptyState
                title="No faculty duty assignments"
                description={`No scheduled teaching classes found for ${department} on ${day}.`}
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {facultyRoster.map((item) => (
                <Card key={item.faculty} className="p-4 hover:border-brand-300 transition-all border border-ink-200 dark:border-ink-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-ink-900 dark:text-ink-100 truncate">
                      {item.faculty}
                    </h4>
                    <Badge tone="brand" className="text-xs shrink-0">
                      {item.sessions.length} session{item.sessions.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-3">
                    {item.sessions.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs">
                        <div className="flex items-center justify-between font-semibold text-ink-800 dark:text-ink-200">
                          <span className="truncate">{s.course}</span>
                          <span className="text-[10px] text-brand-600 dark:text-brand-400">P{s.periodId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-ink-400 mt-1">
                          <span>📍 {s.venue}</span>
                          <span>{s.year} {s.batch ? `(${s.batch})` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Student Batch Inspector */}
      {activeTab === 'batchInspector' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                  Inspect Student Batch Timetable
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                  View full week schedule for a specific academic year and section batch.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-32">
                  <Select label="Year" value={inspectorYear} onChange={(e) => setInspectorYear(e.target.value)}>
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
                        onClick={() => setInspectorBatch(b)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          inspectorBatch === b
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
              department={department}
              year={inspectorYear}
              batch={inspectorBatch}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        day === d
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-ink-400">
                  {department} · {inspectorYear} · Batch {inspectorBatch}
                </span>
              </div>

              {(batchTimetable[day] || []).length === 0 ? (
                <EmptyState
                  title="No classes scheduled"
                  description={`No slots scheduled for ${inspectorYear} Batch ${inspectorBatch} on ${day}.`}
                />
              ) : (
                <div className="space-y-3">
                  {(batchTimetable[day] || []).map((slot, idx) => (
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
