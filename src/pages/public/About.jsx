import { ClipboardCheck, ShieldCheck, BarChart3, Building2, RefreshCcw, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';

const CHALLENGES = [
  { icon: ClipboardCheck, title: 'Manual allocation', text: 'Room assignments handled through spreadsheets and memory don\u2019t scale past a handful of departments.' },
  { icon: ShieldCheck, title: 'Booking conflicts', text: 'Without a shared source of truth, two classes can be assigned the same room at the same time.' },
  { icon: BarChart3, title: 'Poor classroom utilization', text: 'Large capacity rooms sit empty while smaller ones overflow, and nobody has the data to notice.' },
  { icon: Building2, title: 'Cross-department coordination', text: 'PEC and OEC courses need rooms outside their home department, which today means emails and delays.' },
  { icon: RefreshCcw, title: 'Room changes', text: 'When a venue changes last-minute, students often find out only by walking to the wrong room.' },
  { icon: Eye, title: 'Lack of availability visibility', text: 'Faculty can\u2019t see which rooms are actually free right now, so they default to whatever they used last time.' },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
          About Sam Campus Slot
        </span>
        <h1 className="font-display text-4xl font-bold mb-4">Why classroom allocation is harder than it looks</h1>
        <p className="text-ink-500 dark:text-ink-400">
          A campus runs hundreds of classes a week across dozens of rooms. Sam Campus Slot exists to make sure
          every one of those classes lands in the right room, without a single conflict.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {CHALLENGES.map((c) => (
          <Card key={c.title} hover className="p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
              <c.icon size={20} className="text-brand-600" />
            </div>
            <h3 className="font-display font-semibold mb-1.5">{c.title}</h3>
            <p className="text-sm text-ink-500 dark:text-ink-400">{c.text}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 sm:p-10 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-none">
        <h2 className="font-display text-2xl font-bold mb-3">Our approach</h2>
        <p className="text-brand-100">
          Sam Campus Slot scores every classroom against a faculty member's real requirements — capacity, facilities,
          and live availability — and surfaces the best match in seconds. When a conflict is detected, the system
          doesn't just say no; it immediately proposes ranked alternatives, so no one is left without a room.
        </p>
      </Card>
    </div>
  );
}
