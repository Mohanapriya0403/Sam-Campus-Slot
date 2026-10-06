import mongoose from 'mongoose';

// Department-specific venue-change notice model
const venueChangeNoticeSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "VCN-CSE-1" or custom id
    department: { type: String, required: true, index: true },
    year: { type: String, default: null }, // e.g. "III Year"
    batch: { type: String, default: null }, // e.g. "B1"
    course: { type: String, required: true }, // e.g. "OOAD"
    date: { type: String, default: null }, // e.g. "2026-08-17"
    period: { type: String, default: null }, // e.g. "11:10 - 12:00"
    timeRange: { type: String, default: null }, // e.g. "11:10 - 12:00"
    oldVenue: { type: String, required: true },
    newVenue: { type: String, required: true },
    reason: { type: String, required: true },
    isCampusWide: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false, timestamps: true }
);

venueChangeNoticeSchema.index({ department: 1, createdAt: -1 });

export default mongoose.model('VenueChangeNotice', venueChangeNoticeSchema);
