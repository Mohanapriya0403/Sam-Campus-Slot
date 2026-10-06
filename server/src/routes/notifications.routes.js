import { Router } from 'express';
import Notification from '../models/Notification.js';
import VenueChangeNotice from '../models/VenueChangeNotice.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function toNotification(doc) {
  return {
    id: doc._id,
    department: doc.department,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: !!doc.isRead,
    time: doc.createdAt,
  };
}

// GET /api/notifications?department=CSE
// Returns department-specific notices plus any campus-wide ('ALL') notices.
// Admin omitting department receives all notifications across campus.
router.get('/', requireAuth, async (req, res) => {
  const { department } = req.query;
  const filter = department
    ? { $or: [{ department }, { department: 'ALL' }] }
    : req.auth.role === 'admin'
    ? {}
    : { $or: [{ department: req.auth.department || 'ALL' }, { department: 'ALL' }] };

  const docs = await Notification.find(filter).sort({ createdAt: -1 });
  res.json(docs.map(toNotification));
});

// POST /api/notifications (admin only)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { department = 'ALL', type = 'info', title, message } = req.body || {};
  if (!title || !message) return res.status(400).json({ error: 'title and message are required.' });

  const id = `n${Date.now()}`;
  const doc = await Notification.create({
    _id: id,
    department,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date(),
  });

  res.status(201).json(toNotification(doc));
});

// DELETE /api/notifications/:id (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const doc = await Notification.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ ok: true, message: 'Notification deleted.' });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req, res) => {
  const doc = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!doc) return res.status(404).json({ error: 'Notification not found.' });
  res.json(toNotification(doc));
});

// GET /api/notifications/venue-change?department=CSE
router.get('/venue-change', requireAuth, async (req, res) => {
  const { department, year } = req.query;
  if (!department) return res.status(400).json({ error: 'department is required.' });

  const query = { department };
  if (year) query.year = year;

  // Find most recent notice for this department
  const doc = await VenueChangeNotice.findOne(query).sort({ createdAt: -1 }) || (await VenueChangeNotice.findById(department));
  if (!doc) return res.json(null);

  res.json({
    id: doc._id,
    department: doc.department,
    year: doc.year,
    batch: doc.batch,
    course: doc.course,
    date: doc.date,
    period: doc.period,
    oldVenue: doc.oldVenue,
    newVenue: doc.newVenue,
    time: doc.timeRange || doc.period,
    timeRange: doc.timeRange || doc.period,
    reason: doc.reason,
  });
});

// POST /api/notifications/venue-change (admin only)
router.post('/venue-change', requireAuth, requireRole('admin'), async (req, res) => {
  const { department, year, batch, course, date, period, oldVenue, newVenue, reason } = req.body || {};
  if (!department || !course || !oldVenue || !newVenue || !reason) {
    return res.status(400).json({ error: 'department, course, oldVenue, newVenue, and reason are required.' });
  }

  const id = `VCN-${department}-${Date.now()}`;
  const noticeDoc = await VenueChangeNotice.create({
    _id: id,
    department,
    year: year || null,
    batch: batch || null,
    course,
    date: date || '2026-08-17',
    period: period || '10:05 AM – 10:55 AM',
    timeRange: period || '10:05 AM – 10:55 AM',
    oldVenue,
    newVenue,
    reason,
    createdAt: new Date(),
  });

  // Also update default department key for backwards compatibility
  await VenueChangeNotice.findByIdAndUpdate(
    department,
    {
      _id: department,
      department,
      year: year || null,
      batch: batch || null,
      course,
      date: date || '2026-08-17',
      period: period || '10:05 AM – 10:55 AM',
      timeRange: period || '10:05 AM – 10:55 AM',
      oldVenue,
      newVenue,
      reason,
      createdAt: new Date(),
    },
    { upsert: true }
  );

  // Automatically create a department notification so students see it immediately in their notifications feed
  const notifId = `n${Date.now()}`;
  const targetLabel = `${department}${year ? ` ${year}` : ''}${batch ? ` ${batch}` : ''}`;
  await Notification.create({
    _id: notifId,
    department,
    type: 'room_changed',
    title: 'Venue Changed',
    message: `${targetLabel} ${course} moved from ${oldVenue} to ${newVenue} (${reason}).`,
    isRead: false,
    createdAt: new Date(),
  });

  res.status(201).json(noticeDoc);
});

export default router;
