import { useState } from 'react';
import { Building2 } from 'lucide-react';
import Card from '../ui/Card';
import SmartBadge from './SmartBadge';
import { CSE_FLOORS } from '../../data/cseVenues';

const STATUS_DOT = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  maintenance: 'bg-amber-500',
};

export default function FloorMap({ getStatus, onSelectRoom, selectedId }) {
  const [activeFloor, setActiveFloor] = useState(CSE_FLOORS[0].id);
  const floor = CSE_FLOORS.find((f) => f.id === activeFloor);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-brand-600" />
          <h3 className="font-display font-semibold">CSE Block</h3>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-ink-100 dark:bg-ink-800">
          {CSE_FLOORS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeFloor === f.id ? 'bg-white dark:bg-ink-700 shadow-soft text-brand-600' : 'text-ink-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl slot-grid-bg border border-ink-100 dark:border-ink-800 p-5 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {floor.rooms.map((room) => {
            const status = getStatus ? getStatus(room.id) : 'available';
            const isSelected = selectedId === room.id;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom?.(room.id)}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-6 px-3 transition-all bg-white dark:bg-ink-800 hover:-translate-y-0.5 hover:shadow-glow ${
                  isSelected ? 'border-brand-500' : room.smart ? 'border-teal-300 dark:border-teal-700' : 'border-ink-100 dark:border-ink-700'
                }`}
              >
                <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${STATUS_DOT[status] || STATUS_DOT.available}`} />
                <span className="font-display font-bold text-sm text-center leading-tight">{room.id}</span>
                {room.smart && <SmartBadge />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-5 mt-4 text-xs text-ink-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Occupied</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Maintenance</span>
      </div>
    </Card>
  );
}
