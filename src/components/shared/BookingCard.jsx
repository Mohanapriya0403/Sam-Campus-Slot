import { CalendarDays, Clock, DoorOpen, Eye, Pencil, X } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function BookingCard({ booking, onView, onModify, onCancel }) {
  return (
    <Card hover className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
        <DoorOpen size={20} className="text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-display font-semibold">{booking.room}</h4>
          <Badge tone={booking.status}>{booking.status}</Badge>
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{booking.purpose}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-ink-400">
          <span className="flex items-center gap-1"><CalendarDays size={13} /> {booking.date}</span>
          <span className="flex items-center gap-1"><Clock size={13} /> {booking.start} – {booking.end}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => onView?.(booking)} aria-label="View booking" />
        {booking.status === 'upcoming' && (
          <>
            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => onModify?.(booking)} aria-label="Modify booking" />
            <Button size="sm" variant="ghost" icon={X} onClick={() => onCancel?.(booking)} aria-label="Cancel booking" />
          </>
        )}
      </div>
    </Card>
  );
}
