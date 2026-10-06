import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "n1"
    department: { type: String, required: true, index: true }, // 'ALL' for campus-wide notices
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, _id: false }
);

export default mongoose.model('Notification', notificationSchema);
