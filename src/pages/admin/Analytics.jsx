import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import ChartCard from '../../components/shared/ChartCard';
import { getAnalytics } from '../../api/analytics';
import { useApi } from '../../hooks/useApi';

export default function Analytics() {
  const { data } = useApi(() => getAnalytics(), []);
  const {
    weeklyUtilization = [], departmentUtilization = [], floorUtilization = [], smartClassroomUsage = [],
    peakHours = [], roomStatusSplit = [], mostUsedRooms = [], leastUsedRooms = [], crossDeptBookings = [],
  } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Campus-wide classroom usage insights.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Floor-wise Utilization" subtitle="CSE block occupancy by floor">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={floorUtilization}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="floor" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="utilization" fill="#7F1D1D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Smart Classroom Usage" subtitle="Bookings for F9, F12, F14, S5 this month">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={smartClassroomUsage}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="room" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="bookings" fill="#EC8A3D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Utilization Trend" subtitle="Overall room occupancy by day">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyUtilization}>
              <defs>
                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7F1D1D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7F1D1D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Area type="monotone" dataKey="utilization" stroke="#7F1D1D" fill="url(#colorUtil)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak Booking Hours" subtitle="Bookings started per hour, campus-wide">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#B08D6E" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="bookings" fill="#B94F4F" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Room Status Split" subtitle="Current status across all classrooms">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={roomStatusSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {roomStatusSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend verticalAlign="bottom" height={30} iconType="circle" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most / Least Used Classrooms" subtitle="Total bookings this month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mostUsedRooms} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#B08D6E" />
              <YAxis type="category" dataKey="room" tick={{ fontSize: 12 }} stroke="#B08D6E" width={70} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
              <Bar dataKey="bookings" fill="#F4A261" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {leastUsedRooms.map((r) => (
              <span key={r.room} className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">
                {r.room} — {r.bookings} (least used)
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Department-wise Utilization" subtitle="Average room usage by department">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={departmentUtilization}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-ink-100 dark:stroke-ink-700" />
            <XAxis dataKey="department" tick={{ fontSize: 12 }} stroke="#B08D6E" />
            <YAxis tick={{ fontSize: 12 }} stroke="#B08D6E" />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 13 }} />
            <Bar dataKey="utilization" fill="#7F1D1D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Cross-Department Bookings" subtitle="Faculty booking rooms outside their home department">
        <div className="space-y-2.5">
          {crossDeptBookings.map((c) => (
            <div key={`${c.from}-${c.to}`} className="flex items-center justify-between text-sm p-3 rounded-xl bg-ink-50 dark:bg-ink-800">
              <span className="font-medium">{c.from} → {c.to}</span>
              <span className="text-ink-500 dark:text-ink-400">{c.count} bookings</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
