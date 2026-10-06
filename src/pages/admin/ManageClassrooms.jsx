import { useState } from 'react';
import { Wrench, Building2, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SmartBadge from '../../components/shared/SmartBadge';
import EmptyState from '../../components/ui/EmptyState';
import { DEPARTMENTS } from '../../data/cseVenues';
import { getClassroomsGrouped, setClassroomStatus } from '../../api/classrooms';
import { useApi } from '../../hooks/useApi';
import { useToastContext } from '../../context/ToastContext';

const REAL_VENUE_DEPARTMENTS = ['CSE', 'MECH', 'ECE'];

export default function ManageClassrooms() {
  const showToast = useToastContext();
  const [department, setDepartment] = useState('CSE');
  // Grouped-by-floor data now comes straight from the classrooms table for
  // ANY department — every department has a floor/floorId on its rooms
  // (real ones for CSE/MECH/ECE, "Ground/First Floor" placeholders for the
  // rest), so one endpoint covers all of them; no more per-department
  // constant to keep in sync.
  const { data: groups, refetch } = useApi(() => getClassroomsGrouped(department), [department]);

  const toggleMaintenance = async (room) => {
    const next = room.status === 'maintenance' ? 'available' : 'maintenance';
    try {
      await setClassroomStatus(room.id, next);
      showToast(`${room.id} marked ${next === 'maintenance' ? 'under maintenance' : 'available'}.`, 'info');
      refetch();
    } catch (err) {
      showToast(err.message || 'Could not update that room.', 'error');
    }
  };

  const totalRooms = (groups || []).reduce((sum, g) => sum + g.rooms.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Classrooms</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Grouped by floor — Sam Campus Slot's authoritative venue data.</p>
        </div>
        <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="sm:w-48">
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      {!REAL_VENUE_DEPARTMENTS.includes(department) && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-2.5 rounded-xl">
          <Info size={14} className="shrink-0" /> {department} venue names are placeholder/demo data — only CSE's, MECH's, and ECE's structures are sourced from the actual campus layout.
        </div>
      )}

      {totalRooms === 0 ? (
        <EmptyState icon={Building2} title="No classrooms found" description={`No classrooms registered for ${department}.`} />
      ) : (
        (groups || []).map((group) => group.rooms.length > 0 && (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-brand-600" />
              <h3 className="font-display font-semibold text-sm">{group.label}</h3>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-800 mb-6">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Room</th>
                    <th className="px-4 py-3 font-medium">Capacity</th>
                    <th className="px-4 py-3 font-medium">Smart</th>
                    <th className="px-4 py-3 font-medium">Facilities</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                  {group.rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                      <td className="px-4 py-3 font-semibold">{r.id}{r.special && <p className="text-xs font-normal text-ink-400">{r.special}</p>}</td>
                      <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{r.capacity}</td>
                      <td className="px-4 py-3">{r.smart ? <SmartBadge /> : <span className="text-ink-300">—</span>}</td>
                      <td className="px-4 py-3 text-ink-500 dark:text-ink-400 text-xs">{r.facilities.join(', ')}</td>
                      <td className="px-4 py-3"><Badge tone={r.status}>{r.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" icon={Wrench} onClick={() => toggleMaintenance(r)} aria-label="Toggle maintenance" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
