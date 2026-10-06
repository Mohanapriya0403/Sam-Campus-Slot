import { useState, useMemo, useEffect } from 'react';
import { Sparkles, Users, CalendarDays, Clock, Building2, CheckCircle2, XCircle, RotateCcw, Globe2, AlertTriangle, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SmartBadge from '../../components/shared/SmartBadge';
import { CircularScore, ScoreBar } from '../../components/shared/MatchScore';
import { DEPARTMENTS, FACILITIES } from '../../data/cseVenues';
import { getClassrooms } from '../../api/classrooms';
import { getDayConflicts, createBooking } from '../../api/bookings';
import { recordRecentlyViewed } from '../../api/recent';
import { useApi } from '../../hooks/useApi';
import { rankRooms } from '../../utils/allocation';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

const CLASS_TYPES = ['Lecture', 'Lab', 'Seminar', 'PEC', 'OEC', 'Exam'];

export default function SmartAllocation() {
  const { user } = useAuth();
  const showToast = useToastContext();
  const [form, setForm] = useState({
    date: '2026-08-17',
    start: '11:10',
    end: '12:00',
    students: 58,
    department: user?.department || 'CSE',
    classType: 'Lecture',
    crossDept: false,
    smartRequired: true,
    purpose: 'Object Oriented Analysis and Design (OOAD) — B1',
  });
  const [selectedFacilities, setSelectedFacilities] = useState(['Projector', 'Smart Board', 'AC', 'Wi-Fi']);
  const [results, setResults] = useState(null);
  const [conflictRoom, setConflictRoom] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    // Record view in RecentlyViewed
    recordRecentlyViewed({
      resourceType: 'allocation',
      resourceId: 'smart-allocation',
      resourceName: 'Smart Allocation',
      metadata: { department: user?.department || 'CSE' },
    }).catch(() => {});
  }, [user]);

  const toggleFacility = (f) =>
    setSelectedFacilities((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const { data: allRooms } = useApi(() => getClassrooms(), []);
  const { data: deptRooms } = useApi(() => (form.department ? getClassrooms(form.department) : Promise.resolve([])), [form.department]);
  const { data: dayConflicts } = useApi(() => (form.date ? getDayConflicts(form.date) : Promise.resolve([])), [form.date]);

  const eligibleRooms = useMemo(() => {
    const pool = form.crossDept ? allRooms || [] : deptRooms || [];
    // Automatically filter out classrooms under maintenance or blocked
    return pool.filter((r) => r.status !== 'maintenance' && r.status !== 'blocked');
  }, [form.crossDept, allRooms, deptRooms]);

  const handleFindRoom = (e) => {
    e.preventDefault();
    const criteria = {
      studentCount: Number(form.students),
      facilities: selectedFacilities,
      start: form.start,
      end: form.end,
      smartRequired: form.smartRequired,
      conflicts: dayConflicts || [],
      department: form.department,
    };
    const ranked = rankRooms(eligibleRooms, criteria);
    setResults(ranked);
    setConflictRoom(null);
  };

  const handleBook = async (roomResult) => {
    setBooking(true);
    try {
      await createBooking({
        room: roomResult.room.id,
        date: form.date,
        start: form.start,
        end: form.end,
        purpose: form.purpose || `${form.classType} — ${form.department}`,
        studentCount: form.students,
        facilities: selectedFacilities,
        smartRequired: form.smartRequired,
      });
      showToast(`${roomResult.room.id} successfully allocated for ${form.date}, ${form.start}–${form.end}.`, 'success');
      setConflictRoom(null);

      recordRecentlyViewed({
        resourceType: 'booking',
        resourceId: `BK-${roomResult.room.id}-${Date.now()}`,
        resourceName: `${roomResult.room.id} Booking (${form.date})`,
        metadata: { room: roomResult.room.id, date: form.date, start: form.start, end: form.end },
      }).catch(() => {});
    } catch (err) {
      // Conflict detection triggered (409 Conflict)
      // Provide alternative rooms ranked using smart matching algorithm
      const alternatives = (results || [])
        .filter((r) => r.room.id !== roomResult.room.id && r.available)
        .slice(0, 3);

      setConflictRoom({
        room: roomResult.room,
        message: err.message || 'This classroom is already occupied during the requested time.',
        alternatives,
      });
      showToast(err.message || 'This classroom is occupied. See alternatives below.', 'error');
    } finally {
      setBooking(false);
    }
  };

  const best = results?.[0];
  const alternatives = results?.slice(1, 4) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-brand-600" size={24} /> Smart Classroom Allocation
        </h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
          Intelligent multi-factor matching engine: capacity compatibility, availability, smart features, and conflict detection.
        </p>
      </div>

      <Card className="p-6 shadow-sm">
        <form onSubmit={handleFindRoom} className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Input label="Date" type="date" icon={CalendarDays} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Start Time" type="time" icon={Clock} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            <Input label="End Time" type="time" icon={Clock} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            <Input label="Number of Students" type="number" min={1} icon={Users} value={form.students} onChange={(e) => setForm({ ...form, students: e.target.value })} />
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <Select label="Department" icon={Building2} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} disabled={form.crossDept}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Select label="Class Type" value={form.classType} onChange={(e) => setForm({ ...form, classType: e.target.value })}>
              {CLASS_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Course / Purpose" placeholder="e.g. OOAD — B1" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 cursor-pointer border border-brand-100 dark:border-brand-800">
              <input type="checkbox" checked={form.crossDept} onChange={(e) => setForm({ ...form, crossDept: e.target.checked })} className="rounded accent-brand-600" />
              <Globe2 size={16} className="text-brand-600 shrink-0" />
              <span>
                <span className="font-semibold">Search Across Campus</span>
                <span className="text-ink-500 dark:text-ink-400"> — rank classrooms across all campus departments.</span>
              </span>
            </label>
            <label className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 cursor-pointer border border-teal-100 dark:border-teal-800">
              <input type="checkbox" checked={form.smartRequired} onChange={(e) => setForm({ ...form, smartRequired: e.target.checked })} className="rounded accent-teal-600" />
              <Sparkles size={16} className="text-teal-600 shrink-0" />
              <span>
                <span className="font-semibold">Smart Classroom Required</span>
                <span className="text-ink-500 dark:text-ink-400"> — prioritize rooms with interactive board & smart tech.</span>
              </span>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-600 dark:text-ink-300 mb-2.5">Required Facilities</p>
            <div className="flex flex-wrap gap-2">
              {FACILITIES.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFacility(f)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedFacilities.includes(f)
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-400 hover:border-brand-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" icon={Sparkles} className="w-full sm:w-auto">
            Evaluate & Match Best Classroom
          </Button>
        </form>
      </Card>

      {/* Conflict Detection Alert with Recommended Alternatives */}
      {conflictRoom && (
        <Card className="p-6 border-2 border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-900/20 animate-fade-up">
          <div className="flex items-start gap-3.5">
            <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-red-900 dark:text-red-200">
                Conflict Detected: {conflictRoom.room?.id} Unavailable
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {conflictRoom.message || 'This classroom is already occupied during the requested time.'}
              </p>

              {conflictRoom.alternatives && conflictRoom.alternatives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300 mb-2.5">
                    Recommended Alternative Classrooms:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {conflictRoom.alternatives.map((alt) => (
                      <div
                        key={alt.room.id}
                        className="bg-white dark:bg-ink-800 p-3.5 rounded-xl border border-red-200 dark:border-red-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold">{alt.room.id}</span>
                            <span className="text-xs font-bold text-brand-600">{alt.total}% Match</span>
                          </div>
                          <p className="text-xs text-ink-500 mt-1">Cap: {alt.room.capacity} · {alt.room.floor}</p>
                          <p className="text-[11px] text-ink-400 mt-1 line-clamp-2">{alt.explanation}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={() => handleBook(alt)}
                          loading={booking}
                        >
                          Book {alt.room.id}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Matching Engine Results */}
      {results && (
        <div className="space-y-6 animate-fade-up">
          {best && best.total > 0 ? (
            <Card className={`p-6 sm:p-8 border-2 border-brand-300 dark:border-brand-700 ${best.room.smart ? 'glow-smart' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone="success" className="font-bold">#1 Top Recommendation</Badge>
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                      1. {best.room.id} — {best.total}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-display text-3xl font-bold">{best.room.id}</h2>
                    {best.room.smart && <SmartBadge size="md" />}
                  </div>
                  <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 font-medium">
                    {best.room.department} Block · {best.room.floor}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-ink-500">Room Capacity: <strong className="text-ink-900 dark:text-ink-100">{best.room.capacity}</strong></span>
                    <span className="text-ink-500">Requested: <strong className="text-ink-900 dark:text-ink-100">{form.students}</strong></span>
                    <Badge tone={best.available ? 'available' : 'occupied'}>{best.available ? '100% Available' : 'Unavailable'}</Badge>
                  </div>

                  {/* Recommendation Rationale */}
                  <div className="mt-4 p-3.5 rounded-xl bg-brand-50/80 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 mb-0.5">
                      Why this classroom was recommended:
                    </p>
                    <p className="text-xs text-ink-700 dark:text-ink-200 leading-relaxed font-medium">
                      {best.explanation || `Recommended because it matches the requested capacity of ${form.students} students, smart classroom requirement, and time availability during ${form.start}–${form.end}.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {best.room.facilities.map((f) => (
                      <span
                        key={f}
                        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${
                          best.matchedFacilities.includes(f)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-ink-100 text-ink-500 dark:bg-ink-700'
                        }`}
                      >
                        {best.matchedFacilities.includes(f) && <CheckCircle2 size={12} />} {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <CircularScore value={best.total} size={135} />
                  <span className="text-xs font-semibold text-brand-600 mt-2">Overall Match Score</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ink-100 dark:border-ink-800">
                <ScoreBar label="Capacity Compatibility" value={best.capacityScore} />
                <ScoreBar label="Facility Match" value={best.facilityScore} />
                <ScoreBar label="Availability" value={best.availabilityScore} />
                <ScoreBar label="Smart Classroom Fit" value={best.smartScore} />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <Button size="lg" icon={CheckCircle2} className="w-full sm:w-auto" onClick={() => handleBook(best)} loading={booking}>
                  Confirm & Allocate {best.room.id}
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={XCircle}
              title="No classroom matches all your requirements"
              description="Try adjusting your criteria or search across other campus blocks."
              tips={['Increasing the time window', 'Reducing mandatory facilities', 'Disabling Smart Classroom Required', 'Enabling Search Across Campus']}
              action={<Button variant="outline" icon={RotateCcw} onClick={() => setResults(null)}>Reset Requirements</Button>}
            />
          )}

          {/* Ranked Alternative Classrooms */}
          {alternatives.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                Alternative Classrooms ({alternatives.length} Ranked)
              </h3>
              <div className="space-y-3">
                {alternatives.map((r, i) => (
                  <Card key={r.room.id} hover className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-display font-bold text-sm shrink-0">
                        #{i + 2}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold">{r.room.id}</p>
                          {r.room.smart && <SmartBadge />}
                          <Badge tone={r.available ? 'available' : 'occupied'}>{r.available ? 'Available' : 'Unavailable'}</Badge>
                        </div>
                        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                          {r.room.department} · {r.room.floor} · Capacity {r.room.capacity}
                        </p>
                        <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-1 italic">
                          {r.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="font-display font-bold text-brand-600 text-lg">{r.total}%</span>
                        <p className="text-[10px] text-ink-400 uppercase font-semibold">Match</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleBook(r)} loading={booking}>
                        Allocate
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
