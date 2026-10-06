import mongoose from 'mongoose';

// Slots blocked out for a room without a formal booking record (e.g. a
// manually-held slot for an external event). Used alongside `Booking` and
// `TimetableSlot` when checking room availability.
const blockedSlotSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true }, // Classroom id
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reason: { type: String, default: null },
});

export default mongoose.model('BlockedSlot', blockedSlotSchema);
