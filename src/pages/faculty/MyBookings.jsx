import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import BookingCard from '../../components/shared/BookingCard';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import { useToastContext } from '../../context/ToastContext';

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookings() {
  const { user } = useAuth();
  const showToast = useToastContext();
  const { data, refetch } = useApi(() => (user?.id ? getMyBookings(user.id) : Promise.resolve([])), [user?.id]);
  const bookings = data || [];
  const [tab, setTab] = useState('upcoming');
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const filtered = bookings.filter((b) => b.status === tab);

  const handleCancel = async (booking) => {
    try {
      await cancelBooking(booking.id);
      showToast(`Booking for ${booking.room} cancelled.`, 'success');
      refetch();
    } catch (err) {
      showToast(err.message || 'Could not cancel that booking.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Bookings</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Track and manage every classroom you've reserved.</p>
      </div>

      <div className="flex gap-2 border-b border-ink-100 dark:border-ink-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            {t.label} ({bookings.filter((b) => b.status === t.id).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={`No ${tab} bookings`} description={`You don't have any ${tab} classroom bookings yet.`} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onView={setViewing} onModify={() => showToast('Modify flow coming soon.', 'info')} onCancel={setCancelling} />
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.room}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>Purpose:</strong> {viewing.purpose}</p>
            <p><strong>Date:</strong> {viewing.date}</p>
            <p><strong>Time:</strong> {viewing.start} – {viewing.end}</p>
            <p><strong>Status:</strong> <span className="capitalize">{viewing.status}</span></p>
          </div>
        )}
      </Modal>

      <ConfirmationDialog
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={() => handleCancel(cancelling)}
        title="Cancel this booking?"
        description={`This will cancel your booking for ${cancelling?.room} on ${cancelling?.date}. This action cannot be undone.`}
        confirmLabel="Cancel Booking"
      />
    </div>
  );
}
