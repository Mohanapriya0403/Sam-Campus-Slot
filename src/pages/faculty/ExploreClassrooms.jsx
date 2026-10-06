import { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, DoorOpen, RotateCcw, Map as MapIcon, Sparkles, Globe2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import RoomCard from '../../components/shared/RoomCard';
import FloorMap from '../../components/shared/FloorMap';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { DEPARTMENTS } from '../../data/cseVenues';
import { getClassrooms, getClassroomsGrouped } from '../../api/classrooms';
import { createBooking } from '../../api/bookings';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';

const FACILITIES = ['Projector', 'Smart Board', 'AC', 'Computer', 'Wi-Fi', 'Audio System'];
// The quick-book action here doesn't collect a time (Smart Allocation does,
// with full conflict checking) — it books today's opening slot, same demo
// "today" used elsewhere in the app.
const QUICK_BOOK_SLOT = { date: '2026-08-17', start: '09:15', end: '10:05' };

export default function ExploreClassrooms() {
  const { user } = useAuth();
  const showToast = useToastContext();
  const [query, setQuery] = useState('');
  const [floor, setFloor] = useState('');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [availability, setAvailability] = useState('');
  const [smartOnly, setSmartOnly] = useState(false);
  const [crossCampus, setCrossCampus] = useState(false);
  const [view, setView] = useState('grid');
  const [showMap, setShowMap] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [booking, setBooking] = useState(false);

  const { data: allRooms } = useApi(() => (crossCampus ? getClassrooms() : Promise.resolve([])), [crossCampus]);
  const { data: deptRooms } = useApi(() => getClassrooms(department), [department]);
  const { data: floorGroups } = useApi(() => getClassroomsGrouped(department), [department]);

  const pool = crossCampus ? allRooms || [] : deptRooms || [];

  const filtered = useMemo(() => {
    return pool.filter((r) => {
      if (query && !r.id.toLowerCase().includes(query.toLowerCase())) return false;
      if (department && r.department !== department) return false;
      if (floor && r.floorId !== floor) return false;
      if (availability && r.status !== availability) return false;
      if (smartOnly && !r.smart) return false;
      return true;
    });
  }, [pool, query, department, floor, availability, smartOnly]);

  const resetFilters = () => { setQuery(''); setFloor(''); setAvailability(''); setSmartOnly(false); };

  const confirmBooking = async () => {
    setBooking(true);
    try {
      await createBooking({ room: bookingRoom.id, purpose: `Quick booking — ${user?.name || 'Faculty'}`, ...QUICK_BOOK_SLOT });
      showToast(`${bookingRoom.id} booked successfully.`, 'success');
      setBookingRoom(null);
    } catch (err) {
      showToast(err.message || 'Could not book that room.', 'error');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Explore {department} Classrooms</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Browse every classroom, with live availability and floor grouping.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {department === 'CSE' && (
            <Button variant={showMap ? 'primary' : 'outline'} size="sm" icon={MapIcon} onClick={() => setShowMap((s) => !s)}>Floor Map</Button>
          )}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600' : 'text-ink-400'}`} aria-label="Grid view"><LayoutGrid size={16} /></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600' : 'text-ink-400'}`} aria-label="List view"><List size={16} /></button>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm p-3.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 cursor-pointer">
        <input type="checkbox" checked={crossCampus} onChange={(e) => setCrossCampus(e.target.checked)} className="rounded accent-brand-600" />
        <Globe2 size={16} className="text-brand-600 shrink-0" />
        <span>
          <span className="font-medium">Search Across Campus</span>
          <span className="text-ink-500 dark:text-ink-400"> — include classrooms from other departments, useful for PEC/OEC courses.</span>
        </span>
      </label>

      <div className="p-4 rounded-2xl bg-white dark:bg-ink-800/60 border border-ink-100 dark:border-ink-800 grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <Input icon={Search} placeholder="Search room..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={department} onChange={(e) => { setDepartment(e.target.value); setFloor(''); }}>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={floor} onChange={(e) => setFloor(e.target.value)}>
          <option value="">All Floors</option>
          {(floorGroups || []).map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </Select>
        <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="">Any Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </Select>
        <label className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 cursor-pointer">
          <input type="checkbox" checked={smartOnly} onChange={(e) => setSmartOnly(e.target.checked)} className="rounded accent-teal-600" />
          <Sparkles size={14} className="text-teal-600" /> Smart only
        </label>
        <Button variant="outline" icon={SlidersHorizontal} onClick={resetFilters}>Reset</Button>
      </div>

      {showMap && department === 'CSE' && (
        <FloorMap
          getStatus={(id) => (deptRooms || []).find((r) => r.id === id)?.status || 'available'}
          onSelectRoom={(id) => {
            const room = (deptRooms || []).find((r) => r.id === id);
            if (room) setBookingRoom(room);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No classrooms match your filters"
          description="Try widening your search."
          tips={['Clear the floor filter', 'Turn off Smart-only', 'Enable Search Across Campus']}
          action={<Button variant="outline" icon={RotateCcw} onClick={resetFilters}>Reset Filters</Button>}
        />
      ) : (
        <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {filtered.map((r) => <RoomCard key={r.id} room={r} view={view} onBook={setBookingRoom} />)}
        </div>
      )}

      <Modal
        open={!!bookingRoom}
        onClose={() => setBookingRoom(null)}
        title={`Book ${bookingRoom?.id || ''}`}
        footer={<><Button variant="outline" onClick={() => setBookingRoom(null)}>Cancel</Button><Button onClick={confirmBooking} loading={booking}>Confirm Booking</Button></>}
      >
        {bookingRoom && (
          <div className="space-y-3 text-sm">
            <p className="text-ink-500 dark:text-ink-400">{bookingRoom.department} · {bookingRoom.floor} · Capacity {bookingRoom.capacity}</p>
            <div className="flex flex-wrap gap-1.5">
              {bookingRoom.facilities.map((f) => <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-700">{f}</span>)}
            </div>
            <p className="text-ink-500 dark:text-ink-400">You're booking this room for today's default slot. Use Smart Allocation for exact-time conflict checking.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
