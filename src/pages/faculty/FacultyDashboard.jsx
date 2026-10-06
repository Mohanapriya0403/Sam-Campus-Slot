import { Link } from 'react-router-dom';
import { DoorOpen, CalendarCheck, Clock3, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/shared/StatCard';
import BookingCard from '../../components/shared/BookingCard';
import RoomCard from '../../components/shared/RoomCard';
import RecentlyViewed from '../../components/shared/RecentlyViewed';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyBookings } from '../../api/bookings';
import { getClassrooms } from '../../api/classrooms';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { data: bookings } = useApi(() => (user?.id ? getMyBookings(user.id) : Promise.resolve([])), [user?.id]);
  const { data: classrooms } = useApi(() => (user?.department ? getClassrooms(user.department) : Promise.resolve([])), [user?.department]);

  const myBookings = bookings || [];
  const upcoming = myBookings.filter((b) => b.status === 'upcoming');
  const available = (classrooms || []).filter((c) => c.status === 'available');
  const recommended = available.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Good day, {user?.name?.trim() || 'Professor'} 👋</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Here's what's happening with your classes today.</p>
        </div>
        <Link to="/faculty/allocation"><Button size="lg" icon={Sparkles}>+ Allocate Classroom</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DoorOpen} label="Available Classrooms" value={available.length} tone="green" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={myBookings.length} tone="brand" />
        <StatCard icon={Clock3} label="Upcoming Classes" value={upcoming.length} tone="accent" />
        <StatCard icon={AlertTriangle} label="Pending Requests" value={0} tone="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent Bookings</h3>
            <Link to="/faculty/bookings" className="text-sm text-brand-600 flex items-center gap-1 hover:underline">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {myBookings.slice(0, 3).map((b) => <BookingCard key={b.id} booking={b} />)}
            {myBookings.length === 0 && <p className="text-sm text-ink-400">No bookings yet.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/faculty/allocation" className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 dark:border-ink-700 hover:border-brand-300 transition-colors">
              <Sparkles size={18} className="text-brand-600" /> <span className="text-sm font-medium">Find Best Classroom</span>
            </Link>
            <Link to="/faculty/explore" className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 dark:border-ink-700 hover:border-brand-300 transition-colors">
              <DoorOpen size={18} className="text-brand-600" /> <span className="text-sm font-medium">Explore Classrooms</span>
            </Link>
            <Link to="/faculty/timetable" className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 dark:border-ink-700 hover:border-brand-300 transition-colors">
              <Clock3 size={18} className="text-brand-600" /> <span className="text-sm font-medium">View Timetable</span>
            </Link>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Recommended Classrooms For You</h3>
          <Link to="/faculty/explore" className="text-sm text-brand-600 flex items-center gap-1 hover:underline">Explore all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommended.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
}
