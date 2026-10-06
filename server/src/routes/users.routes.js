import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole, signToken } from '../middleware/auth.js';

const router = Router();

function toUser(doc) {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    department: doc.department,
    year: doc.year,
    avatarColor: doc.avatarColor,
    authProvider: doc.authProvider || 'local',
    picture: doc.picture || null,
  };
}

// GET /api/users (admin only) — every account, password hashes never included.
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const docs = await User.find().sort({ name: 1 });
  res.json(docs.map(toUser));
});

// PUT /api/users/:id (admin only) — update user role/department
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, role, department, year } = req.body || {};
  const doc = await User.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'User not found.' });

  if (name !== undefined) doc.name = name;
  if (role !== undefined) doc.role = role;
  if (department !== undefined) doc.department = department;
  if (year !== undefined) doc.year = year;

  await doc.save();
  res.json(toUser(doc));
});

// DELETE /api/users/:id (admin only) — remove user
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  if (req.params.id === req.auth.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }
  const doc = await User.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'User not found.' });
  res.json({ ok: true, message: 'User deleted.' });
});

// PATCH /api/users/me — lets the signed-in user fill in department/year
router.patch('/me', requireAuth, async (req, res) => {
  const { department, year } = req.body || {};
  if (!department) return res.status(400).json({ error: 'department is required.' });

  const doc = await User.findById(req.auth.id);
  if (!doc) return res.status(404).json({ error: 'User not found.' });

  doc.department = department;
  if (doc.role === 'student') doc.year = year || doc.year;
  await doc.save();

  const user = toUser(doc);
  const token = signToken(user);
  res.json({ token, user });
});

export default router;
