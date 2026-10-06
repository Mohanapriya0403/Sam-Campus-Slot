import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Clock, MapPin, User, RefreshCcw, ArrowRight, GraduationCap, Layers, BookOpen } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SmartBadge from '../../components/shared/SmartBadge';
import TimetableUnavailable from '../../components/shared/TimetableUnavailable';
import { useAuth } from '../../context/AuthContext';
import { useTimetable } from '../../hooks/useTimetable';
import { useApi } from '../../hooks/useApi';
import { getVenueChangeNotice } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';
import RecentlyViewed from '../../components/shared/RecentlyViewed';
import { isSmartRoom } from '../../data/cseVenues';

const TODAY = 'Monday'; // demo "today" — 17 Aug 2026 falls on a Monday

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Batch is a filter on this dashboard, not part of the student's identity —
  // it never comes from `user`. The list itself is looked up live (CSE III
  // Year runs B1/B2/B3, MECH III Year runs B1/B2 — never a hardcoded list).
  const [batch, setBatch] = useState('');
  const { available, weeklyTimetable: batchTimetable, availableBatches } = useTimetable(user?.department, user?.year, batch);
  useEffect(() => {
    if (availableBatches.length && !availableBatches.includes(batch)) setBatch(availableBatches[0]);
  }, [availableBatches, batch]);
  const todaysClasses = (batchTimetable?.[TODAY] || []).filter((s) => s.kind !== 'elective' || true);
  const teachingSlots = todaysClasses.filter((s) => s.kind === 'course' || s.kind === 'lab');
  const nextClass = teachingSlots[0];
  // This department's own venue-change notice only — never another
  // department's. If this department has no notice today, the card below
  // simply doesn't render.
  const { data: venueChangeNotice } = useApi(
    () => (user?.department ? getVenueChangeNotice(user.department) : Promise.resolve(null)),
    [user?.department]
  );
  const upcoming = teachingSlots[1];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Good Morning, {user?.name?.split(' ')[0]} 👋</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge tone="info"><GraduationCap size={11} className="inline mr-1" />{user?.department}</Badge>
          <Badge tone="neutral">{user?.year}</Badge>
          <Badge tone="neutral">{user?.semester}</Badge>
          <Badge tone="neutral">AY {user?.academicYear}</Badge>
        </div>
      </div>

      {/* Batch filter — a timetable context, not a login identity. Switching
          re-resolves real course/venue/faculty data for that batch. Hidden
          entirely when this department/year has no uploaded timetable yet. */}
      {availableBatches.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide mr-1">Batch</span>
          {availableBatches.map((b) => (
            <button
              key={b}
              onClick={() => setBatch(b)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
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

      {venueChangeNotice && (
        <Card className="p-5 border-2 border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-900/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
              <RefreshCcw size={18} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold">Venue Changed</p>
                <Badge tone="info">{venueChangeNotice.time}</Badge>
              </div>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
                {venueChangeNotice.course} moved from <span className="line-through">{venueChangeNotice.oldVenue}</span> to <strong>{venueChangeNotice.newVenue}</strong> — {venueChangeNotice.reason}.
              </p>
            </div>
            <Link to="/student/timetable"><Button size="sm" variant="outline">View Timetable</Button></Link>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {!available ? (
          <Card className="p-6 lg:col-span-2">
            <TimetableUnavailable department={user?.department} year={user?.year} batch={batch} />
          </Card>
        ) : (
          <>
        {nextClass && (
          <Card className="p-6 border-2 border-brand-200 dark:border-brand-800">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Next Class</p>
            <h2 className="font-display text-2xl font-bold">{nextClass.title || nextClass.label}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><Clock size={14} /> {nextClass.period.start} – {nextClass.period.end}</p>
            <div className="flex items-center gap-2 mt-4">
              <MapPin size={16} className="text-brand-600" />
              <span className="font-semibold">{nextClass.venue}</span>
              {isSmartRoom(nextClass.venue) && <SmartBadge />}
            </div>
            {nextClass.faculty && (
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-2 flex items-center gap-1.5"><User size={14} /> {nextClass.faculty}</p>
            )}
            <Link to="/student/venue"><Button className="mt-5 w-full sm:w-auto">View Details</Button></Link>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide">Upcoming Class</p>
          </div>
          {upcoming ? (
            <>
              <h3 className="font-display text-lg font-semibold">{upcoming.title || upcoming.label}</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><Clock size={14} /> {upcoming.period.start} – {upcoming.period.end}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1.5"><MapPin size={14} /> {upcoming.venue}</p>
            </>
          ) : (
            <p className="text-sm text-ink-400">No more classes today.</p>
          )}
          <Link to="/student/timetable" className="text-sm text-brand-600 flex items-center gap-1 hover:underline mt-4">Full timetable <ArrowRight size={14} /></Link>
        </Card>
          </>
        )}
      </div>

      {batchTimetable && (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2"><BookOpen size={18} className="text-brand-600" /> Today's Classes</h3>
          <Link to="/student/timetable" className="text-sm text-brand-600 flex items-center gap-1 hover:underline">Week view <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-3">
          {todaysClasses.map((slot, i) => (
            <Card key={i} hover className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-24 shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                <Clock size={13} /> {slot.period.start}–{slot.period.end}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display font-semibold text-sm">{slot.acronym || slot.title || slot.label}</h4>
                  {slot.kind === 'elective' && <Badge tone="info">Elective bank</Badge>}
                  {slot.venue && isSmartRoom(slot.venue) && <SmartBadge />}
                </div>
                {slot.title && slot.acronym && <p className="text-xs text-ink-500 dark:text-ink-400">{slot.title}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400 shrink-0">
                {slot.venue && <span className="flex items-center gap-1"><MapPin size={12} /> {slot.venue}</span>}
                {slot.kind === 'elective' && <span className="flex items-center gap-1"><Layers size={12} /> {slot.options.length} options</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
      )}

      <RecentlyViewed onSelect={() => navigate('/student/my-venues')} />
    </div>
  );
}
