import { useState } from 'react';
import { Wrench, RotateCcw, Ban, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import SmartBadge from '../../components/shared/SmartBadge';
import { getClassrooms, setClassroomStatus } from '../../api/classrooms';
import { createVenueChangeNotice } from '../../api/notifications';
import { useApi } from '../../hooks/useApi';
import { useToastContext } from '../../context/ToastContext';

export default function Maintenance() {
  const showToast = useToastContext();
  const { data: allRooms, refetch } = useApi(() => getClassrooms(), []);
  const rooms = allRooms || [];

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('maintenance');
  const [affectedModal, setAffectedModal] = useState(null); // { room, affectedCount, status }
  const [venueNoticeForm, setVenueNoticeForm] = useState({
    course: 'OOAD',
    newVenue: 'F14',
    reason: 'Smart board hardware upgrade & AC maintenance',
  });

  const inactiveRooms = rooms.filter((r) => r.status === 'maintenance' || r.status === 'blocked');

  const handleUpdateStatus = async (roomId, targetStatus) => {
    try {
      const res = await setClassroomStatus(roomId, targetStatus);
      showToast(`${roomId} marked as ${targetStatus}.`, 'success');
      refetch();

      if ((targetStatus === 'maintenance' || targetStatus === 'blocked') && res.affectedBookingsCount > 0) {
        setAffectedModal({
          room: roomId,
          department: res.department,
          affectedCount: res.affectedBookingsCount,
          status: targetStatus,
        });
      }
    } catch (err) {
      showToast(err.message || 'Could not update classroom status.', 'error');
    }
  };

  const handlePublishVenueChange = async (e) => {
    e.preventDefault();
    if (!affectedModal) return;
    try {
      await createVenueChangeNotice({
        department: affectedModal.department || 'CSE',
        year: 'III Year',
        batch: 'B1',
        course: venueNoticeForm.course,
        date: '2026-08-17',
        period: '10:05 AM – 10:55 AM',
        oldVenue: affectedModal.room,
        newVenue: venueNoticeForm.newVenue,
        reason: venueNoticeForm.reason,
      });
      showToast(`Venue change alert broadcasted to ${affectedModal.department} students!`, 'success');
      setAffectedModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to broadcast venue change notice.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Wrench className="text-brand-600" size={24} /> Classroom Maintenance & Blocking
        </h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
          Rooms flagged as Maintenance or Blocked are immediately excluded from Smart Allocation recommendations.
        </p>
      </div>

      {/* Control Panel: Set Classroom Status */}
      <Card className="p-5 shadow-sm">
        <h3 className="font-display font-semibold text-sm mb-3">Set Classroom Status</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <Select
              label="Select Classroom"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              <option value="">-- Choose a classroom --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.department} · {r.floor} · {r.status})
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-48">
            <Select
              label="Target Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </Select>
          </div>
          <Button
            disabled={!selectedRoomId}
            onClick={() => handleUpdateStatus(selectedRoomId, selectedStatus)}
          >
            Apply Status
          </Button>
        </div>
      </Card>

      {/* Affected Bookings Notice Modal */}
      {affectedModal && (
        <Card className="p-6 border-2 border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display font-bold text-amber-900 dark:text-amber-200">
                Action Required: {affectedModal.affectedCount} Booking(s) Affected by {affectedModal.room} {affectedModal.status}
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                There are active bookings scheduled in {affectedModal.room}. Broadcast a department-specific venue-change alert to notify students and faculty.
              </p>

              <form onSubmit={handlePublishVenueChange} className="mt-4 grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Course</label>
                  <input
                    type="text"
                    value={venueNoticeForm.course}
                    onChange={(e) => setVenueNoticeForm({ ...venueNoticeForm, course: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white dark:bg-ink-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">New Venue</label>
                  <input
                    type="text"
                    value={venueNoticeForm.newVenue}
                    onChange={(e) => setVenueNoticeForm({ ...venueNoticeForm, newVenue: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white dark:bg-ink-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">Reason</label>
                  <input
                    type="text"
                    value={venueNoticeForm.reason}
                    onChange={(e) => setVenueNoticeForm({ ...venueNoticeForm, reason: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white dark:bg-ink-800"
                  />
                </div>
                <div className="sm:col-span-3 flex gap-2 justify-end mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAffectedModal(null)}>Dismiss</Button>
                  <Button type="submit" size="sm" icon={Send}>Broadcast Venue Change</Button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      )}

      {/* List of Inactive / Blocked / Maintenance Rooms */}
      <div>
        <h3 className="font-display font-semibold mb-3">Rooms Under Maintenance or Blocked</h3>
        {inactiveRooms.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No rooms under maintenance or blocked" description="All classrooms are active and available for allocation." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {inactiveRooms.map((r) => (
              <Card key={r.id} className="p-5 border border-ink-100 dark:border-ink-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-lg">{r.id}</h4>
                    {r.smart && <SmartBadge />}
                  </div>
                  <Badge tone={r.status === 'blocked' ? 'danger' : 'maintenance'}>
                    {r.status === 'blocked' ? 'Blocked' : 'Maintenance'}
                  </Badge>
                </div>
                <p className="text-sm text-ink-500 dark:text-ink-400 mb-1">
                  {r.department} Block · {r.floor} · Cap {r.capacity}
                </p>
                <div className="flex gap-2 mt-4 pt-3 border-t border-ink-100 dark:border-ink-800">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={RotateCcw}
                    onClick={() => handleUpdateStatus(r.id, 'available')}
                    className="flex-1"
                  >
                    Restore Available
                  </Button>
                  {r.status === 'maintenance' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Ban}
                      onClick={() => handleUpdateStatus(r.id, 'blocked')}
                    >
                      Block
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
