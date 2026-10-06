import mongoose from 'mongoose';

// One document per physical room. `facilities` is an array of strings.
// `isSample`/`isPlaceholder` exist for completeness (e.g. if a future admin
// bulk-imports rooms flagged as provisional) but nothing in the current seed
// data sets them — every seeded room is treated as a real, bookable venue.
const classroomSchema = new mongoose.Schema(
  {
    _id: { type: String }, // room id, e.g. "F12"
    department: { type: String, required: true, index: true },
    floor: { type: String, default: null },
    floorId: { type: String, default: null },
    smart: { type: Boolean, default: false },
    special: { type: String, default: null },
    capacity: { type: Number, default: null },
    facilities: { type: [String], default: [] },
    status: { type: String, enum: ['available', 'occupied', 'maintenance', 'blocked'], default: 'available' },
    isSample: { type: Boolean, default: false },
    isPlaceholder: { type: Boolean, default: false },
  },
  { _id: false }
);

export default mongoose.model('Classroom', classroomSchema);
