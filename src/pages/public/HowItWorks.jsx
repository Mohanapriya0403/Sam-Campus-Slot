import { Link } from 'react-router-dom';
import { UserCircle2, CalendarSearch, Search, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const STUDENT_STEPS = [
  { icon: UserCircle2, title: 'Sign in with your role', text: 'Pick Student at login and your department, year, and batch load automatically \u2014 no separate batch field to fill in.' },
  { icon: CalendarSearch, title: 'Open your timetable', text: 'See the full week at a glance: every course, its faculty, and the exact room, period by period.' },
  { icon: Search, title: 'Look up any venue', text: 'Tap a class to see the classroom on the floor, or browse "My Classrooms" for every room your course could send you to.' },
];

const FACULTY_STEPS = [
  { icon: UserCircle2, title: 'Sign in as Faculty', text: 'Your dashboard shows today\u2019s classes and any pending bookings at a glance.' },
  { icon: Sparkles, title: 'Request a room with Smart Allocation', text: 'Describe what the class needs \u2014 capacity, projector, smart board, the time slot \u2014 and the engine ranks the best-matching rooms that are actually free then.' },
  { icon: CheckCircle2, title: 'Confirm and you\u2019re booked', text: 'The system checks the pick against the timetable and existing bookings before confirming, so double-bookings are caught before they happen.' },
];

const ADMIN_STEPS = [
  { icon: UserCircle2, title: 'Sign in as Admin', text: 'Manage every classroom, booking, and user from one dashboard.' },
  { icon: GraduationCap, title: 'Keep rooms and data current', text: 'Add or update classrooms, flag one for maintenance, and manage student/faculty accounts.' },
  { icon: CheckCircle2, title: 'Watch utilization', text: 'The analytics view shows which rooms are busiest and which sit empty, across the whole week.' },
];

function StepGroup({ title, steps }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6">{title}</h2>
      <div className="space-y-5">
        {steps.map((s, i) => (
          <Card key={s.title} className="p-5 flex gap-4">
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-display font-bold text-sm">{i + 1}</div>
              {i < steps.length - 1 && <div className="flex-1 w-px bg-ink-200 dark:bg-ink-700 mt-2" />}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={17} className="text-brand-600" />
                <h3 className="font-display font-semibold">{s.title}</h3>
              </div>
              <p className="text-sm text-ink-500 dark:text-ink-400">{s.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
          How It Works
        </span>
        <h1 className="font-display text-4xl font-bold mb-4">Three roles, one shared system</h1>
        <p className="text-ink-500 dark:text-ink-400">
          Students, faculty, and admins each get a dashboard built for what they actually need to do \u2014 all reading from the same live timetable and classroom data.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10 mb-16">
        <StepGroup title="For Students" steps={STUDENT_STEPS} />
        <StepGroup title="For Faculty" steps={FACULTY_STEPS} />
        <StepGroup title="For Admins" steps={ADMIN_STEPS} />
      </div>

      <Card className="p-8 sm:p-10 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-none text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Ready to try it?</h2>
        <p className="text-brand-100 mb-6 max-w-xl mx-auto">
          Create an account and pick your role \u2014 your dashboard is ready with real data the moment you sign in.
        </p>
        <Link to="/register"><Button size="lg" variant="accent">Get Started</Button></Link>
      </Card>
    </div>
  );
}
