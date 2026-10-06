import { Router } from 'express';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import Classroom from '../models/Classroom.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function toBooking(doc) {
  return {
    id: doc._id,
    room: doc.room,
    facultyId: doc.facultyId,
    date: doc.date,
    start: doc.startTime,
    end: doc.endTime,
    purpose: doc.purpose,
    status: doc.status,
  };
}

function timeToMinutes(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return h * 60 + m;
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/** Checks whether `room` is already booked or manually blocked on `date`
 * for any time overlapping [start, end). `excludeBookingId` lets an update
 * ignore the booking being edited. */
async function findConflict(room, date, start, end, excludeBookingId = null) {
  const bookingFilter = { room, date, status: { $ne: 'cancelled' } };
  if (excludeBookingId) bookingFilter._id = { $ne: excludeBookingId };
  const bookingDocs = await Booking.find(bookingFilter);
  for (const b of bookingDocs) {
    if (timesOverlap(start, end, b.startTime, b.endTime)) {
      return { type: 'booking', id: b._id, room: b.room, start: b.startTime, end: b.endTime, purpose: b.purpose };
    }
  }
  const blockedDocs = await BlockedSlot.find({ room, date });
  for (const s of blockedDocs) {
    if (timesOverlap(start, end, s.startTime, s.endTime)) {
      return { type: 'blocked', reason: s.reason, room: s.room, start: s.startTime, end: s.endTime };
    }
  }
  return null;
}

/** Server-side Smart Allocation Scoring Engine */
function calculateSmartScore(room, conflicts, criteria) {
  const { studentCount = 50, facilities = [], start = '09:00', end = '10:00', smartRequired = false, department = 'CSE', preferredFloor } = criteria;

  // 1. Capacity Compatibility (0 - 100)
  let capacityScore = 0;
  const capacity = room.capacity || 60;
  if (capacity >= studentCount) {
    const slack = capacity - studentCount;
    capacityScore = slack <= 15 ? 100 : Math.max(50, 100 - slack * 1.2);
  } else {
    capacityScore = Math.max(0, 100 - (studentCount - capacity) * 4);
  }

  // 2. Facilities Match (0 - 100)
  const reqFacilities = Array.isArray(facilities) ? facilities : [];
  const roomFacilities = room.facilities || [];
  const matchedFacilities = reqFacilities.filter((f) => roomFacilities.includes(f));
  const facilityScore = reqFacilities.length ? Math.round((matchedFacilities.length / reqFacilities.length) * 100) : 100;

  // 3. Availability Check
  const sMin = timeToMinutes(start);
  const eMin = timeToMinutes(end);
  const roomConflicts = (conflicts || []).filter((c) => c.room === room.id);
  const hasConflict = roomConflicts.some((c) => {
    const cs = timeToMinutes(c.start);
    const ce = timeToMinutes(c.end);
    return sMin < ce && cs < eMin;
  });
  const isAvailable = room.status === 'available' && !hasConflict;
  const availabilityScore = isAvailable ? 100 : 0;

  // 4. Smart Room Requirement
  const smartScore = smartRequired ? (room.smart ? 100 : 0) : room.smart ? 100 : 80;

  // 5. Department Suitability
  const deptScore = room.department === department ? 100 : 75;

  // 6. Floor Match (if preferred)
  const floorScore = preferredFloor ? (room.floor === preferredFloor ? 100 : 70) : 100;

  // Total weighted score
  const total = isAvailable
    ? Math.round(
        capacityScore * 0.3 +
          facilityScore * 0.25 +
          availabilityScore * 0.25 +
          smartScore * 0.1 +
          deptScore * 0.05 +
          floorScore * 0.05
      )
    : Math.round(capacityScore * 0.3 + facilityScore * 0.25 + smartScore * 0.1) * 0.3; // penalized heavily if unavailable

  // Recommendation Rationale
  let explanation = '';
  if (isAvailable && total >= 80) {
    const reasons = [];
    if (capacityScore >= 85) reasons.push(`matches requested capacity of ${studentCount} students (${capacity} seats)`);
    if (room.smart && smartRequired) reasons.push('provides required smart classroom features');
    if (matchedFacilities.length > 0) reasons.push(`has ${matchedFacilities.join(', ')}`);
    reasons.push(`available during ${start}–${end}`);
    if (room.department === department) reasons.push(`in the ${department} block`);
    explanation = `Recommended because it ${reasons.join(', ')}.`;
  } else if (!isAvailable) {
    explanation = `Currently unavailable during ${start}–${end} due to a scheduling clash or maintenance.`;
  } else {
    explanation = `Available with partial facility match (${facilityScore}%) and capacity ${capacity}.`;
  }

  return {
    room: {
      id: room._id,
      department: room.department,
      floor: room.floor,
      capacity: room.capacity,
      smart: room.smart,
      facilities: room.facilities,
      status: room.status,
    },
    capacityScore: Math.round(capacityScore),
    facilityScore,
    availabilityScore,
    smartScore,
    deptScore,
    total,
    available: isAvailable,
    matchedFacilities,
    missingFacilities: reqFacilities.filter((f) => !roomFacilities.includes(f)),
    explanation,
  };
}

// POST /api/bookings/smart-allocate — Smart Classroom Matching Engine
router.post('/smart-allocate', requireAuth, async (req, res) => {
  const {
    date = '2026-08-17',
    start = '11:10',
    end = '12:00',
    studentCount = 58,
    department = 'CSE',
    facilities = [],
    smartRequired = false,
    crossDept = false,
    preferredFloor,
  } = req.body || {};

  const roomFilter = crossDept ? {} : { department };
  // Never recommend rooms under maintenance or blocked
  roomFilter.status = { $nin: ['maintenance', 'blocked'] };

  const rooms = await Classroom.find(roomFilter);
  const bookingDocs = await Booking.find({ date, status: { $ne: 'cancelled' } });
  const blockedDocs = await BlockedSlot.find({ date });
  const conflicts = [
    ...bookingDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
    ...blockedDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
  ];

  const criteria = { studentCount: Number(studentCount), facilities, start, end, smartRequired, department, preferredFloor };
  const scored = rooms
    .map((r) => calculateSmartScore(r, conflicts, criteria))
    .sort((a, b) => b.total - a.total);

  const best = scored[0] || null;
  const alternatives = scored.slice(1, 6);

  res.json({
    totalEligible: scored.length,
    best,
    alternatives,
    allRanked: scored,
  });
});

// GET /api/bookings?facultyId=u1 — a faculty member's own bookings.
// GET /api/bookings (admin, no facultyId) — every booking.
router.get('/', requireAuth, async (req, res) => {
  const { facultyId } = req.query;
  if (facultyId) {
    if (req.auth.role !== 'admin' && req.auth.id !== facultyId) {
      return res.status(403).json({ error: 'You can only view your own bookings.' });
    }
    const docs = await Booking.find({ facultyId }).sort({ date: -1, startTime: -1 });
    return res.json(docs.map(toBooking));
  }
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Admin access required to view all bookings.' });
  const docs = await Booking.find().sort({ date: -1, startTime: -1 });
  res.json(docs.map(toBooking));
});

// POST /api/bookings — create a booking with conflict detection and alternative recommendation
router.post('/', requireAuth, requireRole('faculty', 'admin'), async (req, res) => {
  const { room, date, start, end, purpose, studentCount, facilities, smartRequired } = req.body || {};
  if (!room || !date || !start || !end || !purpose) {
    return res.status(400).json({ error: 'room, date, start, end, and purpose are all required.' });
  }
  if (start >= end) return res.status(400).json({ error: 'start must be before end.' });

  const roomDoc = await Classroom.findById(room);
  if (!roomDoc) return res.status(404).json({ error: 'No such classroom.' });
  if (roomDoc.status === 'maintenance') {
    return res.status(409).json({ error: 'This classroom is currently under maintenance.' });
  }
  if (roomDoc.status === 'blocked') {
    return res.status(409).json({ error: 'This classroom is blocked by administration.' });
  }

  const conflict = await findConflict(room, date, start, end);
  if (conflict) {
    // Automatically find ranked alternatives!
    const otherRooms = await Classroom.find({
      _id: { $ne: room },
      department: roomDoc.department,
      status: 'available',
    });
    const bookingDocs = await Booking.find({ date, status: { $ne: 'cancelled' } });
    const blockedDocs = await BlockedSlot.find({ date });
    const conflicts = [
      ...bookingDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
      ...blockedDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
    ];
    const criteria = {
      studentCount: Number(studentCount) || roomDoc.capacity || 50,
      facilities: facilities || roomDoc.facilities || [],
      start,
      end,
      smartRequired: !!smartRequired,
      department: roomDoc.department,
    };
    const alternatives = otherRooms
      .map((r) => calculateSmartScore(r, conflicts, criteria))
      .filter((s) => s.available)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    return res.status(409).json({
      error: 'This classroom is already occupied during the requested time.',
      conflict,
      alternatives,
    });
  }

  const id = `BK-${Date.now()}`;
  const doc = await Booking.create({
    _id: id,
    room,
    facultyId: req.auth.id,
    date,
    startTime: start,
    endTime: end,
    purpose,
    status: 'upcoming',
  });
  res.status(201).json(toBooking(doc));
});

// PUT /api/bookings/:id — edit booking details with conflict re-check
router.put('/:id', requireAuth, async (req, res) => {
  const doc = await Booking.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Booking not found.' });

  if (req.auth.role !== 'admin' && doc.facultyId !== req.auth.id) {
    return res.status(403).json({ error: 'You can only edit your own bookings.' });
  }

  const { room, date, start, end, purpose, status } = req.body || {};
  const targetRoom = room || doc.room;
  const targetDate = date || doc.date;
  const targetStart = start || doc.startTime;
  const targetEnd = end || doc.endTime;

  if (targetStart >= targetEnd) return res.status(400).json({ error: 'start must be before end.' });

  // Re-check conflict
  const conflict = await findConflict(targetRoom, targetDate, targetStart, targetEnd, doc._id);
  if (conflict) {
    return res.status(409).json({ error: 'The room is already occupied during the updated time.', conflict });
  }

  if (room !== undefined) doc.room = room;
  if (date !== undefined) doc.date = date;
  if (start !== undefined) doc.startTime = start;
  if (end !== undefined) doc.endTime = end;
  if (purpose !== undefined) doc.purpose = purpose;
  if (status !== undefined) doc.status = status;

  await doc.save();
  res.json(toBooking(doc));
});

// DELETE /api/bookings/:id — cancel/delete booking
router.delete('/:id', requireAuth, async (req, res) => {
  const doc = await Booking.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Booking not found.' });

  if (req.auth.role !== 'admin' && doc.facultyId !== req.auth.id) {
    return res.status(403).json({ error: 'You can only delete your own bookings.' });
  }

  await Booking.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: `Booking ${req.params.id} deleted.` });
});

// PATCH /api/bookings/:id/cancel — cancel booking
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const doc = await Booking.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Booking not found.' });
  if (req.auth.role !== 'admin' && doc.facultyId !== req.auth.id) {
    return res.status(403).json({ error: 'You can only cancel your own bookings.' });
  }
  doc.status = 'cancelled';
  await doc.save();
  res.json(toBooking(doc));
});

// GET /api/bookings/availability?room=F12&date=2026-08-17
router.get('/availability', requireAuth, async (req, res) => {
  const { room, date } = req.query;
  if (!room || !date) return res.status(400).json({ error: 'room and date are required.' });
  const bookingDocs = await Booking.find({ room, date, status: { $ne: 'cancelled' } });
  const blockedDocs = await BlockedSlot.find({ room, date });
  res.json({
    bookings: bookingDocs.map((r) => ({ id: r._id, start: r.startTime, end: r.endTime, purpose: r.purpose })),
    blocked: blockedDocs.map((r) => ({ start: r.startTime, end: r.endTime, reason: r.reason })),
  });
});

// GET /api/bookings/day?date=2026-08-17
router.get('/day', requireAuth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required.' });
  const bookingDocs = await Booking.find({ date, status: { $ne: 'cancelled' } });
  const blockedDocs = await BlockedSlot.find({ date });
  res.json([
    ...bookingDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
    ...blockedDocs.map((r) => ({ room: r.room, start: r.startTime, end: r.endTime })),
  ]);
});

export default router;
