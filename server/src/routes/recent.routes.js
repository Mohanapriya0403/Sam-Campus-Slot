import { Router } from 'express';
import RecentlyViewed from '../models/RecentlyViewed.js';
import Classroom from '../models/Classroom.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const MAX_RETURNED = 10;

// POST /api/recent — record user access to a classroom, timetable, booking, venue, or smart allocation
router.post('/', requireAuth, async (req, res) => {
  const { resourceType = 'classroom', resourceId, resourceName, roomId, metadata = {} } = req.body || {};
  const userId = req.auth.id;

  // Backwards compatibility with { roomId }
  const effectiveId = resourceId || roomId;
  if (!effectiveId) return res.status(400).json({ error: 'resourceId or roomId is required.' });

  let name = resourceName;
  let roomDoc = null;
  if (resourceType === 'classroom' || roomId) {
    roomDoc = await Classroom.findById(effectiveId);
    if (!name) name = roomDoc ? `${roomDoc._id} Classroom` : `${effectiveId} Classroom`;
  } else if (!name) {
    name = effectiveId;
  }

  const _id = `${userId}:${resourceType}:${effectiveId}`;
  const now = new Date();

  const doc = await RecentlyViewed.findByIdAndUpdate(
    _id,
    {
      _id,
      userId,
      user: userId,
      resourceType,
      resourceId: effectiveId,
      resourceName: name,
      room: roomDoc ? roomDoc._id : effectiveId,
      department: roomDoc ? roomDoc.department : metadata.department || null,
      accessedAt: now,
      viewedAt: now,
      metadata: {
        ...metadata,
        floor: roomDoc?.floor || metadata.floor,
        smart: roomDoc?.smart !== undefined ? roomDoc.smart : metadata.smart,
        status: roomDoc?.status || metadata.status,
      },
    },
    { upsert: true, new: true }
  );

  res.status(201).json(doc);
});

// GET /api/recent — returns user's recent items sorted by accessedAt descending
router.get('/', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  const views = await RecentlyViewed.find({
    $or: [{ userId }, { user: userId }],
  })
    .sort({ accessedAt: -1, viewedAt: -1 })
    .limit(MAX_RETURNED);

  // Re-join classrooms to get current live status/capacity
  const classroomIds = views.filter((v) => v.resourceType === 'classroom' || v.room).map((v) => v.resourceId || v.room);
  const rooms = await Classroom.find({ _id: { $in: classroomIds } });
  const roomMap = new Map(rooms.map((r) => [r._id, r]));

  const result = views.map((v) => {
    const isRoom = v.resourceType === 'classroom' || (!v.resourceType && v.room);
    const liveRoom = isRoom ? roomMap.get(v.resourceId || v.room) : null;

    return {
      id: v._id,
      resourceType: v.resourceType || 'classroom',
      resourceId: v.resourceId || v.room,
      resourceName: v.resourceName || (liveRoom ? `${liveRoom._id} Classroom` : v.room),
      department: liveRoom?.department || v.department,
      accessedAt: v.accessedAt || v.viewedAt,
      // Classroom-specific live fields if applicable
      room: liveRoom
        ? {
            id: liveRoom._id,
            department: liveRoom.department,
            floor: liveRoom.floor,
            smart: !!liveRoom.smart,
            capacity: liveRoom.capacity,
            facilities: liveRoom.facilities || [],
            status: liveRoom.status,
          }
        : null,
      metadata: v.metadata || {},
    };
  });

  res.json(result);
});

// DELETE /api/recent — clear all recent items for the user
router.delete('/', requireAuth, async (req, res) => {
  const userId = req.auth.id;
  await RecentlyViewed.deleteMany({ $or: [{ userId }, { user: userId }] });
  res.json({ ok: true });
});

export default router;
