import { CalendarClock, Sparkles, Building2, CalendarDays, Bell, BarChart3, Wrench, Languages, Moon } from 'lucide-react';
import Card from '../../components/ui/Card';

const FEATURES = [
  {
    icon: CalendarClock,
    title: 'Real department timetables',
    text: 'Students and faculty see their actual weekly schedule — department, year, and batch aware — with the course, faculty, and venue for every period, not a generic template.',
  },
  {
    icon: Sparkles,
    title: 'Smart classroom allocation',
    text: 'Faculty describe what a class needs — capacity, facilities, time — and the allocation engine scores every available room and ranks the best matches, including smart classrooms.',
  },
  {
    icon: Building2,
    title: 'Explore classrooms',
    text: 'Browse every room in a department by floor, see which ones are smart classrooms, and check live availability before booking.',
  },
  {
    icon: CalendarDays,
    title: 'Bookings, with conflict checks',
    text: 'Faculty can book a room for a slot; the system checks for clashes against the timetable and other bookings before confirming.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    text: 'Room changes, booking confirmations, and maintenance alerts reach students and faculty as they happen, instead of finding out at the classroom door.',
  },
  {
    icon: BarChart3,
    title: 'Utilization analytics',
    text: 'Admins get a dashboard of how classrooms are actually used across the week, so under-used rooms and overbooked ones both become visible.',
  },
  {
    icon: Wrench,
    title: 'Maintenance tracking',
    text: 'Rooms can be flagged for maintenance and taken out of the allocation pool until they\u2019re marked available again.',
  },
  {
    icon: Languages,
    title: 'Multi-language interface',
    text: 'The whole app is available in English, Tamil, and Hindi, switchable from any page.',
  },
  {
    icon: Moon,
    title: 'Light & dark mode',
    text: 'A full dark theme, not just an inverted filter \u2014 every page is designed for both.',
  },
];

export default function Features() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
          Features
        </span>
        <h1 className="font-display text-4xl font-bold mb-4">Everything a campus needs to manage its classrooms</h1>
        <p className="text-ink-500 dark:text-ink-400">
          One system for students, faculty, and admins — built around real timetables and real rooms, not a generic scheduler.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <Card key={f.title} hover className="p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
              <f.icon size={20} className="text-brand-600" />
            </div>
            <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">{f.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
