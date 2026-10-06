import { useState } from 'react';
import { CalendarCheck, XCircle, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { getAllBookings, cancelBooking, deleteBooking } from '../../api/bookings';
import { useApi } from '../../hooks/useApi';
import { useToastContext } from '../../context/ToastContext';

export default function ManageBookings() {
  const showToast = useToastContext();
  const [status, setStatus] = useState('');
  const { data, refetch } = useApi(() => getAllBookings(), []);
  const bookings = data || [];
  const filtered = status ? bookings.filter((b) => b.status === status) : bookings;

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id);
      showToast(`Booking ${id} cancelled.`, 'info');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete booking record ${id}?`)) return;
    try {
      await deleteBooking(id);
      showToast(`Booking ${id} deleted permanently.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to delete booking.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CalendarCheck className="text-brand-600" size={24} /> Classroom Bookings Management
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            Monitor, inspect, and manage every classroom allocation across campus.
          </p>
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings found" description="Try a different filter." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-800 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Faculty ID</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-ink-400">{b.id}</td>
                  <td className="px-4 py-3 font-semibold">{b.room}</td>
                  <td className="px-4 py-3 text-xs text-ink-500">{b.facultyId}</td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{b.date}</td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{b.start} – {b.end}</td>
                  <td className="px-4 py-3 text-ink-500 dark:text-ink-400">{b.purpose}</td>
                  <td className="px-4 py-3"><Badge tone={b.status}>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.status === 'upcoming' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          title="Cancel booking"
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(b.id)}
                        title="Delete booking"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
