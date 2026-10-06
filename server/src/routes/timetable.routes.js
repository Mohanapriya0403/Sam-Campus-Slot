import { Router } from 'express';
import TimetableSlot from '../models/TimetableSlot.js';
import DepartmentYear from '../models/DepartmentYear.js';
import Classroom from '../models/Classroom.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toSlot(doc) {
  return {
    id: doc._id,
    period: { id: doc.periodId, start: doc.periodStart, end: doc.periodEnd },
    kind: doc.kind,
    acronym: doc.acronym || undefined,
    title: doc.title || undefined,
    code: doc.code || undefined,
    label: doc.label || undefined,
    faculty: doc.faculty || undefined,
    venue: doc.venue || undefined,
    options: doc.options || undefined,
  };
}

// GET /api/timetable/faculty — Dedicated faculty teaching schedule & workload
router.get('/faculty', async (req, res) => {
  const { faculty: facultyQuery, department } = req.query;
  const targetFaculty = (facultyQuery || '').trim();
  const targetDept = (department || '').trim();

  const query = {};
  if (targetDept && targetDept !== 'ALL') query.department = targetDept;

  const allSlots = await TimetableSlot.find(query).sort({ day: 1, sortOrder: 1 }).lean();

  const distinctFaculties = Array.from(
    new Set(allSlots.map((s) => s.faculty).filter(Boolean))
  ).sort();

  let matchedSlots = [];
  if (targetFaculty) {
    const searchTerms = targetFaculty
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !['dr', 'prof', 'mr', 'mrs', 'ms'].includes(w.replace('.', '')));

    matchedSlots = allSlots.filter((slot) => {
      if (!slot.faculty) return false;
      const fn = slot.faculty.toLowerCase();
      if (fn.includes(targetFaculty.toLowerCase())) return true;
      return searchTerms.some((term) => fn.includes(term));
    });
  }

  // Fallback to first available faculty if search is blank or no match
  let activeFacultyName = targetFaculty;
  if (matchedSlots.length === 0 && distinctFaculties.length > 0) {
    if (!targetFaculty) {
      activeFacultyName = distinctFaculties[0];
      matchedSlots = allSlots.filter((s) => s.faculty === distinctFaculties[0]);
    }
  }

  const weeklySchedule = {};
  for (const day of DAY_ORDER) weeklySchedule[day] = [];
  for (const slot of matchedSlots) {
    if (!weeklySchedule[slot.day]) weeklySchedule[slot.day] = [];
    weeklySchedule[slot.day].push({
      ...toSlot(slot),
      department: slot.department,
      year: slot.year,
      batch: slot.batch,
    });
  }

  const venues = Array.from(new Set(matchedSlots.map((s) => s.venue).filter((v) => v && v !== '—')));
  const courses = Array.from(new Set(matchedSlots.map((s) => s.title || s.label).filter(Boolean)));

  res.json({
    faculty: activeFacultyName || 'Faculty',
    department: targetDept || 'ALL',
    weeklySchedule,
    totalSessions: matchedSlots.length,
    venues,
    courses,
    distinctFaculties,
  });
});

// GET /api/timetable/admin/matrix — Master Department Venue Matrix
router.get('/admin/matrix', async (req, res) => {
  const { department = 'CSE', day = 'Monday' } = req.query;

  const slots = await TimetableSlot.find({ department, day }).sort({ sortOrder: 1 }).lean();
  const allDeptSlots = await TimetableSlot.find({ department }).lean();
  const rooms = await Classroom.find({ department }).sort({ _id: 1 }).lean();

  const standardPeriods = [
    { id: '1', start: '08:30', end: '09:20', label: 'P1 (08:30–09:20)' },
    { id: '2', start: '09:15', end: '10:05', label: 'P2 (09:15–10:05)' },
    { id: '3', start: '10:05', end: '10:55', label: 'P3 (10:05–10:55)' },
    { id: '4', start: '11:10', end: '12:00', label: 'P4 (11:10–12:00)' },
    { id: '5', start: '12:00', end: '12:50', label: 'P5 (12:00–12:50)' },
    { id: '6', start: '13:50', end: '14:40', label: 'P6 (13:50–14:40)' },
    { id: '7', start: '14:40', end: '15:30', label: 'P7 (14:40–15:30)' },
  ];

  let venues = Array.from(new Set(allDeptSlots.map((s) => s.venue).filter((v) => v && v !== '—'))).sort();
  if (rooms.length > 0) {
    const roomIds = rooms.map((r) => r._id);
    venues = Array.from(new Set([...venues, ...roomIds])).sort();
  }

  const matrix = venues.map((venue) => {
    const periodSlots = {};
    for (const p of standardPeriods) {
      const match = slots.find(
        (s) => s.venue === venue && (s.periodId === p.id || s.periodStart === p.start)
      );
      periodSlots[p.id] = match
        ? {
            id: match._id,
            title: match.title || match.label,
            code: match.code,
            batch: match.batch,
            year: match.year,
            faculty: match.faculty,
            kind: match.kind,
            period: { id: p.id, start: match.periodStart, end: match.periodEnd },
          }
        : null;
    }
    return { venue, periods: periodSlots };
  });

  const occupiedCount = slots.filter((s) => s.venue && s.venue !== '—').length;
  const facultyOnDuty = Array.from(new Set(slots.map((s) => s.faculty).filter(Boolean)));

  res.json({
    department,
    day,
    totalDeptSlots: allDeptSlots.length,
    activeSlotsToday: slots.length,
    venuesCount: venues.length,
    occupiedCount,
    facultyOnDutyCount: facultyOnDuty.length,
    standardPeriods,
    matrix,
  });
});

// GET /api/timetable/available — every { department, year } combination that
// currently has at least one uploaded batch.
router.get('/available', async (req, res) => {
  const docs = await DepartmentYear.find().sort({ department: 1, year: 1 }).select('department year semester batches -_id');
  res.json(docs.map((d) => ({ department: d.department, year: d.year, semester: d.semester, batches: d.batches })));
});

function normalizeDept(dept) {
  if (!dept) return '';
  const s = String(dept).trim();
  return (s === 'AI&DS' || s.toUpperCase() === 'AI&DS') ? 'AIDS' : s;
}

// GET /api/timetable/meta?department=CSE&year=III Year
// -> { semester, batches: ["B1","B2","B3"] }
router.get('/meta', async (req, res) => {
  const { department, year } = req.query;
  if (!department || !year) return res.status(400).json({ error: 'department and year are required.' });

  const targetDept = normalizeDept(department);
  const doc = await DepartmentYear.findOne({ department: targetDept, year });
  if (!doc) return res.json({ semester: null, batches: [] });
  res.json({ semester: doc.semester, batches: doc.batches });
});

// GET /api/timetable/:department/:year — RESTful path support
router.get('/:department/:year', async (req, res) => {
  const { department, year } = req.params;
  const { batch } = req.query;
  const targetDept = normalizeDept(department);

  const dy = await DepartmentYear.findOne({ department: targetDept, year });
  if (!dy) {
    return res.status(404).json({ error: `No timetable available for ${department} ${year}.` });
  }

  const effectiveBatch = batch || (dy.batches && dy.batches[0]);
  if (!effectiveBatch) {
    return res.status(404).json({ error: `No batch available for ${department} ${year}.` });
  }

  const docs = await TimetableSlot.find({ department: targetDept, year, batch: effectiveBatch }).sort({ day: 1, sortOrder: 1 });
  if (!docs.length) {
    return res.status(404).json({ error: `No timetable uploaded for ${department} ${year} ${effectiveBatch}.` });
  }

  const grid = {};
  for (const doc of docs) {
    if (!grid[doc.day]) grid[doc.day] = [];
    grid[doc.day].push(toSlot(doc));
  }
  const ordered = {};
  for (const day of DAY_ORDER) if (grid[day]) ordered[day] = grid[day];

  res.json({
    department,
    year,
    batch: effectiveBatch,
    semester: dy.semester,
    batches: dy.batches,
    weeklyTimetable: ordered,
  });
});

// GET /api/timetable?department=CSE&year=III Year&batch=B1
router.get('/', async (req, res) => {
  const { department, year, batch } = req.query;
  if (!department || !year || !batch) {
    return res.status(400).json({ error: 'department, year, and batch are all required.' });
  }
  const targetDept = normalizeDept(department);

  const docs = await TimetableSlot.find({ department: targetDept, year, batch }).sort({ day: 1, sortOrder: 1 });
  if (!docs.length) return res.status(404).json({ error: 'No timetable uploaded for that department/year/batch.' });

  const grid = {};
  for (const doc of docs) {
    if (!grid[doc.day]) grid[doc.day] = [];
    grid[doc.day].push(toSlot(doc));
  }
  const ordered = {};
  for (const day of DAY_ORDER) if (grid[day]) ordered[day] = grid[day];
  res.json(ordered);
});

// POST /api/timetable/slot (admin only)
router.post('/slot', requireAuth, requireRole('admin'), async (req, res) => {
  const { department, year, batch, day, periodId, periodStart, periodEnd, kind, title, acronym, code, faculty, venue } = req.body || {};
  if (!department || !year || !batch || !day || !periodId) {
    return res.status(400).json({ error: 'department, year, batch, day, and periodId are required.' });
  }

  const slot = await TimetableSlot.create({
    department,
    year,
    batch,
    day,
    periodId,
    periodStart: periodStart || '09:00',
    periodEnd: periodEnd || '10:00',
    kind: kind || 'course',
    title: title || null,
    acronym: acronym || null,
    code: code || null,
    faculty: faculty || null,
    venue: venue || null,
  });

  res.status(201).json(toSlot(slot));
});

// DELETE /api/timetable/slot/:id (admin only)
router.delete('/slot/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const doc = await TimetableSlot.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Slot not found.' });
  res.json({ ok: true, message: 'Slot removed.' });
});

export default router;
