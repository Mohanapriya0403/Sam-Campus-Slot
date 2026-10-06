import { useNavigate } from 'react-router-dom';
import { History, DoorOpen, CalendarDays, CalendarCheck, MapPin, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';
import SmartBadge from './SmartBadge';
import { useApi } from '../../hooks/useApi';
import { getRecentlyViewed } from '../../api/recent';
import { useAuth } from '../../context/AuthContext';

function formatAccessTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${timeStr}`;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

export default function RecentlyViewed({ onSelect, refreshKey }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: items, loading } = useApi(() => getRecentlyViewed(), [refreshKey]);

  if (loading || !items || items.length === 0) return null;

  const handleClick = (item) => {
    if (onSelect) {
      onSelect(item);
      return;
    }
    const role = user?.role || 'student';
    switch (item.resourceType) {
      case 'timetable':
        navigate(`/${role}/timetable`);
        break;
      case 'classroom':
        navigate(role === 'student' ? '/student/my-venues' : `/${role}/explore`);
        break;
      case 'venue':
        navigate('/student/venue');
        break;
      case 'allocation':
        navigate(role === 'faculty' ? '/faculty/allocation' : `/${role}/dashboard`);
        break;
      case 'booking':
        navigate(`/${role}/bookings`);
        break;
      default:
        navigate(`/${role}/dashboard`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'timetable':
        return <CalendarDays size={14} className="text-brand-600" />;
      case 'booking':
        return <CalendarCheck size={14} className="text-accent-500" />;
      case 'venue':
        return <MapPin size={14} className="text-teal-600" />;
      case 'allocation':
        return <Sparkles size={14} className="text-amber-500" />;
      default:
        return <DoorOpen size={14} className="text-brand-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-ink-400 uppercase tracking-wide">
        <History size={13} /> Recently Accessed
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className="shrink-0 w-48 text-left rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-800/60 p-3.5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="flex items-center gap-1.5 font-display font-semibold text-sm truncate">
                {getIcon(item.resourceType)}
                <span className="truncate">{item.resourceName || item.resourceId}</span>
              </span>
              {item.room?.smart && <SmartBadge />}
            </div>

            <p className="text-xs text-ink-500 dark:text-ink-400 truncate">
              {item.department ? `${item.department} Block` : item.resourceType.toUpperCase()}
            </p>

            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-ink-100 dark:border-ink-800">
              {item.room?.status ? (
                <Badge tone={item.room.status} dot>{item.room.status}</Badge>
              ) : (
                <span className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider">
                  {item.resourceType}
                </span>
              )}
              <span className="text-[10px] text-ink-400 font-medium">
                {formatAccessTime(item.accessedAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
