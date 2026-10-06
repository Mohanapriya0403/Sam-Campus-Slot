import mongoose from 'mongoose';

// _id is a plain string (e.g. "u1", "u1735689600000") instead of an
// auto-generated ObjectId, so ids stay stable across reseeds and match the
// ids the frontend already expects.
const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'faculty', 'admin'] },
    department: { type: String, default: null },
    year: { type: String, default: null },
    avatarColor: { type: String, default: null },
    // 'google' for accounts created via Sign in with Google (see auth.routes.js
    // POST /google); those get an unusable random passwordHash since they
    // never log in with a password. 'local' is the normal email+password flow.
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    picture: { type: String, default: null }, // Google account avatar, when available
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false }, _id: false }
);

export default mongoose.model('User', userSchema);
