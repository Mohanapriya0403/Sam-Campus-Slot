import { Building2, Users, Layers, Info } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SmartBadge from './SmartBadge';

const STATUS_TONE = { available: 'available', occupied: 'occupied', maintenance: 'maintenance' };

export default function RoomCard({ room, onBook, view = 'grid' }) {
  if (view === 'list') {
    return (
      <Card hover className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold">{room.id}</h4>
            {room.smart && <SmartBadge />}
            <Badge tone={STATUS_TONE[room.status]}>{room.status}</Badge>
            {room.isPlaceholder && <Badge tone="neutral"><Info size={10} className="inline mr-0.5" />Demo data</Badge>}
          </div>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1.5">
            <Building2 size={14} /> {room.department} · {room.floor}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {room.facilities.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">{f}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-sm text-ink-500 flex items-center gap-1.5"><Users size={14} /> {room.capacity} seats</div>
          <Button size="sm" variant={room.status === 'available' ? 'primary' : 'outline'} disabled={room.status !== 'available'} onClick={() => onBook?.(room)}>
            {room.status === 'available' ? 'Book' : 'Unavailable'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className={`p-5 flex flex-col ${room.smart ? 'glow-smart' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
          <Layers size={20} className="text-brand-600" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={STATUS_TONE[room.status]} dot>{room.status}</Badge>
          {room.smart && <SmartBadge />}
        </div>
      </div>
      <h4 className="font-display font-semibold text-lg">{room.id}</h4>
      <p className="text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1.5 mt-1">
        <Building2 size={14} /> {room.department} · {room.floor}
      </p>
      <p className="text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1.5 mt-1">
        <Users size={14} /> Capacity {room.capacity}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
        {room.facilities.map((f) => (
          <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">{f}</span>
        ))}
      </div>
      {room.isSample && (
        <p className="text-[11px] text-ink-400 flex items-center gap-1 mt-2 mb-1">
          <Info size={11} /> {room.isPlaceholder ? 'Placeholder demo data' : 'Capacity/facilities are sample data'}
        </p>
      )}
      <Button
        className="mt-auto w-full"
        variant={room.status === 'available' ? 'primary' : 'outline'}
        disabled={room.status !== 'available'}
        onClick={() => onBook?.(room)}
      >
        {room.status === 'available' ? 'View Classroom' : 'Unavailable'}
      </Button>
    </Card>
  );
}
