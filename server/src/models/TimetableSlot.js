import mongoose from 'mongoose';

// One document per (department, year, batch, day, period) timetable cell.
// This is a flattened version of the department timetable data — the
// authoritative source for what a student/faculty member sees on their
// weekly timetable page.
const timetableSlotSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: String, required: true },
  batch: { type: String, required: true },
  day: { type: String, required: true },
  periodId: { type: String, required: true },
  periodStart: { type: String, required: true },
  periodEnd: { type: String, required: true },
  sortOrder: { type: Number, required: true },
  kind: { type: String, required: true, enum: ['course', 'lab', 'elective', 'free'] },
  acronym: { type: String, default: null },
  title: { type: String, default: null },
  code: { type: String, default: null },
  label: { type: String, default: null },
  faculty: { type: String, default: null },
  venue: { type: String, default: null },
  options: { type: mongoose.Schema.Types.Mixed, default: null },
});

timetableSlotSchema.index({ department: 1, year: 1, batch: 1, day: 1 });

export default mongoose.model('TimetableSlot', timetableSlotSchema);
