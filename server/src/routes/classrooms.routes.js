import { Router } from 'express';
import Classroom from '../models/Classroom.js';
import Booking from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function toRoom(doc) {
  return {
    id: doc._id,
    department: doc.department,
    floor: doc.floor,
    floorId: doc.floorId,
    smart: !!doc.smart,
    special: doc.special,
    capacity: doc.capacity,
    facilities: doc.facilities || [],
    status: doc.status,
    isSample: !!doc.isSample,
    isPlaceholder: !!doc.isPlaceholder,
  };
}

// GET /api/classrooms?department=CSE — all rooms, optionally filtered
router.get('/', async (req, res) => {
  const { department } = req.query;
  const filter = department ? { department } : {};
  const docs = await Classroom.find(filter).sort({ department: 1, floorId: 1, _id: 1 });
  res.json(docs.map(toRoom));
});

// GET /api/classrooms/grouped?department=CSE
router.get('/grouped', async (req, res) => {
  const { department } = req.query;
  if (!department) return res.status(400).json({ error: 'department is required.' });
  const docs = await Classroom.find({ department }).sort({ floorId: 1, _id: 1 });
  const groups = [];
  const byId = new Map();
  for (const doc of docs) {
    const key = doc.floorId || 'default';
    if (!byId.has(key)) {
      const group = { id: key, label: doc.floor || 'Rooms', rooms: [] };
      byId.set(key, group);
      groups.push(group);
    }
    byId.get(key).rooms.push(toRoom(doc));
  }
  res.json(groups);
});

// GET /api/classrooms/:id — single room details
router.get('/:id', async (req, res) => {
  const doc = await Classroom.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Classroom not found.' });
  res.json(toRoom(doc));
});

// POST /api/classrooms (admin) — add a room
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { id, department, floor, floorId, smart, special, capacity, facilities, status } = req.body || {};
  if (!id || !department) return res.status(400).json({ error: 'id and department are required.' });

  const existing = await Classroom.findById(id);
  if (existing) return res.status(409).json({ error: 'A room with that ID already exists.' });

  const doc = await Classroom.create({
    _id: id,
    department,
    floor: floor || null,
    floorId: floorId || null,
    smart: !!smart,
    special: special || null,
    capacity: capacity ?? null,
    facilities: facilities || [],
    status: status || 'available',
    isSample: false,
    isPlaceholder: false,
  });
  res.status(201).json(toRoom(doc));
});

// PUT /api/classrooms/:id (admin) — edit a room
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { department, floor, floorId, smart, special, capacity, facilities, status } = req.body || {};
  const doc = await Classroom.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Classroom not found.' });

  if (department !== undefined) doc.department = department;
  if (floor !== undefined) doc.floor = floor;
  if (floorId !== undefined) doc.floorId = floorId;
  if (smart !== undefined) doc.smart = !!smart;
  if (special !== undefined) doc.special = special;
  if (capacity !== undefined) doc.capacity = capacity;
  if (facilities !== undefined) doc.facilities = facilities;
  if (status !== undefined) {
    if (!['available', 'occupied', 'maintenance', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    doc.status = status;
  }

  await doc.save();
  res.json(toRoom(doc));
});

// DELETE /api/classrooms/:id (admin) — remove a room
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const doc = await Classroom.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Classroom not found.' });
  res.json({ ok: true, message: `Classroom ${req.params.id} deleted.` });
});

// PATCH /api/classrooms/:id/status (admin) — toggle maintenance/available/occupied/blocked
router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status } = req.body || {};
  if (!['available', 'occupied', 'maintenance', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'status must be available, occupied, maintenance, or blocked.' });
  }

  const doc = await Classroom.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!doc) return res.status(404).json({ error: 'Room not found.' });

  // If set to maintenance or blocked, check if any active bookings are affected
  let affectedBookings = [];
  if (status === 'maintenance' || status === 'blocked') {
    affectedBookings = await Booking.find({ room: req.params.id, status: 'upcoming' });
  }

  res.json({
    ...toRoom(doc),
    affectedBookingsCount: affectedBookings.length,
    affectedBookings: affectedBookings.map((b) => ({ id: b._id, date: b.date, facultyId: b.facultyId })),
  });
});

export default router;
