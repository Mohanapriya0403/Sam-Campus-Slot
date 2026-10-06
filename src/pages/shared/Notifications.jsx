import { useState } from 'react';
import { CheckCheck, BellOff, Plus, Send, X, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import NotificationCard from '../../components/shared/NotificationCard';
import { getNotifications, markNotificationRead, createNotification, deleteNotification } from '../../api/notifications';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../context/ToastContext';
import { DEPARTMENTS } from '../../data/cseVenues';

export default function Notifications() {
  const { user } = useAuth();
  const showToast = useToastContext();
  const isAdmin = user?.role === 'admin';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    department: 'CSE',
    type: 'room_changed',
    title: 'Venue Changed',
    message: '',
  });

  // Admin gets all notifications, while students/faculty only get their own department + ALL
  const { data, refetch } = useApi(
    () => (isAdmin ? getNotifications() : user?.department ? getNotifications(user.department) : Promise.resolve([])),
    [user?.department, isAdmin]
  );
  const items = data || [];
  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await markNotificationRead(id);
    refetch();
  };

  const markAllRead = async () => {
    await Promise.all(items.filter((n) => !n.read).map((n) => markNotificationRead(n.id)));
    refetch();
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      showToast('Notification deleted.', 'info');
      refetch();
    } catch (err) {
      showToast(err.message || 'Could not delete notification.', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      showToast('Please provide a title and message.', 'error');
      return;
    }
    try {
      await createNotification({
        department: form.department,
        type: form.type,
        title: form.title,
        message: form.message,
      });
      showToast(`Notification broadcasted to ${form.department}!`, 'success');
      setShowCreateModal(false);
      setForm({ department: 'CSE', type: 'room_changed', title: 'Venue Changed', message: '' });
      refetch();
    } catch (err) {
      showToast(err.message || 'Failed to broadcast notification.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications & Venue Alerts</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            {isAdmin ? 'All campus alerts and broadcasts.' : `${user?.department || 'Campus'} department notifications.`}
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllRead}>
              Mark All Read
            </Button>
          )}
          {isAdmin && (
            <Button size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>
              Broadcast Alert
            </Button>
          )}
        </div>
      </div>

      {/* Broadcast Modal for Admins */}
      {showCreateModal && (
        <Card className="p-6 border-2 border-brand-300 dark:border-brand-700 bg-white dark:bg-ink-900 shadow-glow animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Broadcast Campus Alert</h3>
            <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-ink-400 hover:bg-ink-100">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Target Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="ALL">ALL (Campus-Wide)</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select
                label="Notice Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="room_changed">Venue Changed</option>
                <option value="maintenance">Maintenance</option>
                <option value="confirmed">Classroom Allocated</option>
                <option value="conflict">Booking Conflict</option>
                <option value="schedule">Timetable Updated</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <Input
              label="Notification Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Venue Changed: OOAD F12 → F14"
            />
            <div>
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 uppercase tracking-wide mb-1.5">
                Message Content
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Details of the announcement or venue change..."
                className="w-full text-sm p-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" icon={Send}>
                Send Broadcast
              </Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState icon={BellOff} title="You're all caught up" description="No notifications right now." />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <div key={n.id} className="relative group">
              <NotificationCard notification={n} onMarkRead={markRead} />
              {isAdmin && (
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete notification"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
