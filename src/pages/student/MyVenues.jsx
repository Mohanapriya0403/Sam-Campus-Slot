import { useState } from 'react';
import { Building2, MapPinOff, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import SmartBadge from '../../components/shared/SmartBadge';
import RecentlyViewed from '../../components/shared/RecentlyViewed';
import EmptyState from '../../components/ui/EmptyState';
import { getClassroomsGrouped } from '../../api/classrooms';
import { logRecentView } from '../../api/recent';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

// Every department now has real, bookable venue data (named halls/labs for
// CSE/MECH/ECE, campus-numbered rooms for the rest — see
// server/seed-data/cseVenues.js), so this page no longer restricts itself to
// a hardcoded subset of departments.
export default function MyVenues() {
  const { user } = useAuth();
  const dept = user?.department;
  const { data: groups } = useApi(() => (dept ? getClassroomsGrouped(dept) : Promise.resolve(null)), [dept]);
  const [selected, setSelected] = useState(null);
  const [recentKey, setRecentKey] = useState(0);

  const openRoom = (room) => {
    setSelected(room);
    logRecentView(room.id)
      .then(() => setRecentKey((k) => k + 1)) // bumps RecentlyViewed's refreshKey so it refetches
      .catch(() => {}); // a logging hiccup shouldn't block viewing the room
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">My Classrooms</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Every {dept || 'your department'} venue — tap one for details.</p>
      </div>

      <RecentlyViewed onSelect={openRoom} refreshKey={recentKey} />

      {!groups ? (
        <Card className="p-6">
          <EmptyState
            icon={MapPinOff}
            title="Venue Data Not Available"
            description={`The classroom/venue list for ${dept || 'your department'} has not been uploaded to Sam Campus Slot yet.`}
          />
        </Card>
      ) : (
        groups.map((group) => (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={17} className="text-brand-600" />
              <h3 className="font-display font-semibold">{group.label}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.rooms.map((room) => (
                <Card
                  key={room.id}
                  hover
                  className={`p-5 flex items-center justify-between text-left w-full cursor-pointer ${room.smart ? 'glow-smart' : ''}`}
                  onClick={() => openRoom(room)}
                >
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{room.id}</p>
                    {room.special && <p className="text-xs text-ink-400 mt-0.5 truncate">{room.special}</p>}
                  </div>
                  {room.smart && <SmartBadge />}
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone={selected.status} dot>{selected.status}</Badge>
              {selected.smart && <SmartBadge />}
              {selected.special && <Badge tone="neutral">{selected.special}</Badge>}
            </div>
            <p className="text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
              <Building2 size={15} /> {selected.department} · {selected.floor}
            </p>
            <p className="text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
              <Users size={15} /> Capacity {selected.capacity ?? '—'}
            </p>
            {selected.facilities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.facilities.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">{f}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
