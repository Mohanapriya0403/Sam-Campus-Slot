import {
  LayoutDashboard, Sparkles, DoorOpen, CalendarCheck, CalendarDays, Bell, Settings,
  Building2, Users, Wrench, BarChart3, MapPin,
} from 'lucide-react';

export const NAV_BY_ROLE = {
  faculty: [
    { to: '/faculty/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { to: '/faculty/allocation', label: 'smartAllocation', icon: Sparkles },
    { to: '/faculty/explore', label: 'exploreClassrooms', icon: DoorOpen },
    { to: '/faculty/bookings', label: 'myBookings', icon: CalendarCheck },
    { to: '/faculty/timetable', label: 'teachingSchedule', icon: CalendarDays },
    { to: '/faculty/notifications', label: 'notifications', icon: Bell },
    { to: '/faculty/settings', label: 'settings', icon: Settings },
  ],
  student: [
    { to: '/student/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { to: '/student/timetable', label: 'myTimetable', icon: CalendarDays },
    { to: '/student/venue', label: 'venue', icon: MapPin },
    { to: '/student/my-venues', label: 'myVenues', icon: Building2 },
    { to: '/student/notifications', label: 'notifications', icon: Bell },
    { to: '/student/settings', label: 'settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'dashboard', icon: LayoutDashboard },
    { to: '/admin/classrooms', label: 'classrooms', icon: Building2 },
    { to: '/admin/bookings', label: 'bookings', icon: CalendarCheck },
    { to: '/admin/timetable', label: 'masterSchedule', icon: CalendarDays },
    { to: '/admin/users', label: 'users', icon: Users },
    { to: '/admin/maintenance', label: 'maintenance', icon: Wrench },
    { to: '/admin/analytics', label: 'analytics', icon: BarChart3 },
    { to: '/admin/notifications', label: 'notifications', icon: Bell },
    { to: '/admin/settings', label: 'settings', icon: Settings },
  ],
};
