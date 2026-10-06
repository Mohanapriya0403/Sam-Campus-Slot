import mongoose from 'mongoose';

// Flexible model tracking access history per user across:
// classrooms, timetables, bookings, venues, and smart allocation.
const recentlyViewedSchema = new mongoose.Schema(
  {
    _id: { type: String }, // compound key `${userId}:${resourceType}:${resourceId}`
    userId: { type: String, required: true, index: true },
    user: { type: String, index: true }, // backwards-compat alias
    resourceType: {
      type: String,
      required: true,
      enum: ['classroom', 'timetable', 'booking', 'venue', 'allocation'],
      default: 'classroom',
    },
    resourceId: { type: String, required: true },
    resourceName: { type: String, required: true },
    room: { type: String }, // optional classroom identifier
    department: { type: String },
    accessedAt: { type: Date, default: Date.now, index: true },
    viewedAt: { type: Date, default: Date.now }, // backwards-compat alias
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false, timestamps: true }
);

recentlyViewedSchema.index({ userId: 1, accessedAt: -1 });

export default mongoose.model('RecentlyViewed', recentlyViewedSchema);
