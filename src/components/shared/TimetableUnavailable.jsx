import { useState } from 'react';
import { CalendarClock, BellRing, Check } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

/**
 * The one place that renders "this department/batch has no uploaded
 * timetable yet". Used by every student/faculty timetable-reading page so the
 * empty state — and the rule that we never fall back to CSE's data — stays
 * consistent app-wide instead of being re-implemented per page.
 */
export default function TimetableUnavailable({ department, year, batch }) {
  const [notified, setNotified] = useState(false);

  return (
    <EmptyState
      icon={CalendarClock}
      title="Timetable Not Available"
      description={
        department
          ? `The timetable for ${department}${year ? ` · ${year}` : ''}${batch ? ` · Batch ${batch}` : ''} has not been uploaded to Sam Campus Slot yet.`
          : 'Your department timetable has not been added to Sam Campus Slot yet.'
      }
      action={
        <Button
          variant="outline"
          size="sm"
          icon={notified ? Check : BellRing}
          disabled={notified}
          onClick={() => setNotified(true)}
        >
          {notified ? "We'll notify you" : 'Notify Me'}
        </Button>
      }
    />
  );
}
