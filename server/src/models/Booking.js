import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "BK-1735689600000"
    room: { type: String, required: true, index: true }, // Classroom id
    facultyId: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    purpose: { type: String, required: true },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, _id: false }
);

bookingSchema.index({ room: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);
