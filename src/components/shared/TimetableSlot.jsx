import { Clock, MapPin, User, Layers } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import SmartBadge from './SmartBadge';
import { isSmartRoom } from '../../data/cseVenues';

// Renders one scheduled period — works for real courses, labs, and elective blocks.
export default function TimetableSlot({ slot, highlight = false }) {
  const { period, kind } = slot;
  const timeLabel = `${period.start} – ${period.end}`;

  if (kind === 'elective') {
    const venue = slot.venue;
    const smart = venue && isSmartRoom(venue);
    return (
      <Card className={`p-4 sm:p-5 border-dashed ${highlight ? 'border-2 border-brand-300 dark:border-brand-700' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-20 shrink-0 flex items-center gap-1.5 text-xs font-semibold text-ink-400">
            <Clock size={13} /> {timeLabel}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-display font-semibold text-sm">{slot.label}</h4>
              <Badge tone="info">Elective bank</Badge>
              {smart && <SmartBadge />}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {slot.options.map((o) => (
                <span key={o} className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">{o}</span>
              ))}
            </div>
            {venue && (
              <div className="flex items-center gap-1 mt-2 text-xs text-ink-400">
                <MapPin size={12} /> {venue}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const venue = slot.venue;
  const smart = venue && isSmartRoom(venue);

  return (
    <Card hover className={`p-4 sm:p-5 ${highlight ? 'border-2 border-brand-300 dark:border-brand-700' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-20 shrink-0 flex items-center gap-1.5 text-xs font-semibold text-brand-600">
          <Clock size={13} /> {timeLabel}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold">{slot.acronym || slot.label}</h4>
            {kind === 'lab' && <Badge tone="neutral">Lab</Badge>}
            {smart && <SmartBadge />}
          </div>
          {slot.title && <p className="text-sm text-ink-500 dark:text-ink-400">{slot.title}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-ink-400">
            {slot.faculty && <span className="flex items-center gap-1"><User size={12} /> {slot.faculty}</span>}
            {venue && <span className="flex items-center gap-1"><MapPin size={12} /> {venue}</span>}
          </div>
        </div>
        {venue && (
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 items-center justify-center shrink-0">
            <Layers size={18} className="text-brand-600" />
          </div>
        )}
      </div>
    </Card>
  );
}
