import mongoose from 'mongoose';

// Presentation-ready analytics payloads (the admin Analytics dashboard's
// charts). These are illustrative/sample figures, same as the original
// frontend mock — stored as one document per named metric rather than
// modelled as fully normalized collections, since recomputing genuinely
// accurate utilization figures needs real historical booking volume this
// demo dataset doesn't have.
const analyticsCacheSchema = new mongoose.Schema(
  {
    _id: { type: String }, // metric key, e.g. "weeklyUtilization"
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: 'updatedAt' }, _id: false }
);

export default mongoose.model('AnalyticsCache', analyticsCacheSchema);
