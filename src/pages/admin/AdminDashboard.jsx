import { Link } from 'react-router-dom';
import {
  Users,
  DoorOpen,
  CalendarCheck,
  Clock,
  Sparkles,
  Ban,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Bell,
  BarChart3,
  Wrench,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import StatCard from '../../components/shared/StatCard';
import ChartCard from '../../components/shared/ChartCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getClassrooms } from '../../api/classrooms';
import { getAnalytics } from '../../api/analytics';
import { useApi } from '../../hooks/useApi';

export default function AdminDashboard() {
  const { data: rooms } = useApi(() => getClassrooms(), []);
  const { data: analytics, loading } = useApi(() => getAnalytics(), []);
  const allClassrooms = rooms || [];

  const overview = analytics?.overview || {};
  const weeklyUtilization = analytics?.weeklyUtilization || [];
  const departmentUtilization = analytics?.departmentUtilization || [];

  // Live MongoDB stats
  const totalUsers = overview.totalUsers ?? 7;
  const totalClassrooms = overview.totalClassrooms ?? allClassrooms.length;
  const availableClassrooms = overview.availableClassrooms ?? allClassrooms.filter((c) => c.status === 'available').length;
  const todaysBookings = overview.todaysBookings ?? 0;
  const activeBookings = overview.activeBookings ?? 0;
  const blockedClassrooms = overview.blockedClassrooms ?? allClassrooms.filter((c) => c.status === 'blocked' || c.status === 'maintenance').length;
  const smartClassrooms = overview.smartClassrooms ?? allClassrooms.filter((c) => c.smart).length;
  const peakUsagePeriod = overview.peakUsagePeriod ?? '10:00 AM – 11:00 AM';

  const departmentsList = ['CSE', 'IT', 'AIDS', 'MECH', 'CIVIL', 'EEE', 'ECE', 'S&H'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="brand"><ShieldCheck size={12} className="inline mr-1" /> Admin Portal</Badge>
            <span className="text-xs text-ink-400 font-medium">MongoDB Connected</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Dashboard & Operations</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            Real-time management and analytics across all classrooms, timetables, and campus bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/analytics">
            <Button variant="outline" size="sm" icon={BarChart3}>Full Analytics</Button>
          </Link>
          <Link to="/admin/timetable">
            <Button size="sm" icon={CalendarDays}>Manage Timetable</Button>
          </Link>
        </div>
      </div>

      {/* Mandatory Real MongoDB-derived Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} tone="brand" />
        <StatCard icon={DoorOpen} label="Total Classrooms" value={totalClassrooms} tone="brand" />
        <StatCard icon={CalendarCheck} label="Today's Bookings" value={todaysBookings} tone="accent" />
        <StatCard icon={Clock} label="Active Bookings" value={activeBookings} tone="accent" />
        <StatCard icon={CheckCircle2} label="Available Classrooms" value={availableClassrooms} tone="green" />
        <StatCard icon={Ban} label="Blocked / Maintenance" value={blockedClassrooms} tone="red" />
        <StatCard icon={Sparkles} label="Smart Classrooms" value={smartClassrooms} tone="brand" />
        <StatCard icon={TrendingUp} label="Peak Usage Period" value={peakUsagePeriod} tone="green" />
      </div>

      {/* Quick Action Navigation Grid */}
      <Card className="p-5">
        <h3 className="font-display font-semibold text-sm uppercase tracking-wide text-ink-500 mb-3">
          Administrative Modules
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link to="/admin/users" className="flex items-center justify-between p-3.5 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-brand-400 transition-colors">
            <div className="flex items-center gap-2.5">
              <Users size={18} className="text-brand-600" />
              <div>
                <p className="font-semibold text-sm">Users</p>
                <p className="text-xs text-ink-400">{totalUsers} accounts</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-ink-400" />
          </Link>

          <Link to="/admin/classrooms" className="flex items-center justify-between p-3.5 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-brand-400 transition-colors">
            <div className="flex items-center gap-2.5">
              <DoorOpen size={18} className="text-brand-600" />
              <div>
                <p className="font-semibold text-sm">Classrooms</p>
                <p className="text-xs text-ink-400">{totalClassrooms} rooms</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-ink-400" />
          </Link>

          <Link to="/admin/timetable" className="flex items-center justify-between p-3.5 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-brand-400 transition-colors">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={18} className="text-brand-600" />
              <div>
                <p className="font-semibold text-sm">Timetables</p>
                <p className="text-xs text-ink-400">Slots & Batches</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-ink-400" />
          </Link>

          <Link to="/admin/notifications" className="flex items-center justify-between p-3.5 rounded-xl border border-ink-100 dark:border-ink-800 hover:border-brand-400 transition-colors">
            <div className="flex items-center gap-2.5">
              <Bell size={18} className="text-brand-600" />
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs text-ink-400">Broadcasts & Venues</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-ink-400" />
          </Link>
        </div>
      </Card>

      {/* Live Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Classroom Utilization" subtitle="Live occupancy trend from MongoDB bookings">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyUtilization}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Line type="monotone" dataKey="utilization" stroke="#7F1D1D" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department Utilization" subtitle="Classroom occupancy percentage per academic block">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentUtilization}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="utilization" fill="#EC8A3D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Department Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Campus Academic Departments</h3>
          <span className="text-xs text-ink-400 font-medium">8 Supported Departments</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentsList.map((d) => {
            const deptRooms = allClassrooms.filter((c) => c.department === d);
            const avail = deptRooms.filter((r) => r.status === 'available').length;
            const maint = deptRooms.filter((r) => r.status === 'maintenance' || r.status === 'blocked').length;
            return (
              <Card key={d} hover className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold">{d}</p>
                  {d === 'CSE' && <Badge tone="info">Live Timetable</Badge>}
                </div>
                <p className="text-xs text-ink-400 mt-1">{deptRooms.length} Registered Classrooms</p>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-green-600 font-semibold">{avail} Available</span>
                  {maint > 0 && <span className="text-red-500 font-medium">{maint} Blocked</span>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
