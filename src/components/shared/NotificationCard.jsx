import { CheckCircle2, XCircle, RefreshCcw, Wrench, CalendarClock, BellRing } from 'lucide-react';

const CONFIG = {
  confirmed: { icon: CheckCircle2, tone: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300' },
  cancelled: { icon: XCircle, tone: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300' },
  room_changed: { icon: RefreshCcw, tone: 'text-brand-600 bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300' },
  conflict: { icon: XCircle, tone: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300' },
  maintenance: { icon: Wrench, tone: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300' },
  schedule: { icon: CalendarClock, tone: 'text-brand-600 bg-brand-100 dark:bg-brand-900/30 dark:text-brand-300' },
};

export default function NotificationCard({ notification, onMarkRead }) {
  const { icon: Icon, tone } = CONFIG[notification.type] || { icon: BellRing, tone: 'text-ink-500 bg-ink-100' };
  return (
    <button
      onClick={() => onMarkRead?.(notification.id)}
      className={`w-full flex items-start gap-3 text-left p-4 rounded-xl border transition-colors ${
        notification.read ? 'border-ink-100 dark:border-ink-800' : 'border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10'
      } hover:bg-ink-50 dark:hover:bg-ink-800`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{notification.message}</p>
        <p className="text-xs text-ink-400 mt-1">{notification.time}</p>
      </div>
    </button>
  );
}
