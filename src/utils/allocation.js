// Core "smart allocation" scoring engine used by the Smart Allocation page and conflict detection.
// Evaluates candidate classrooms across capacity, real-time availability, facility match,
// smart-room equipment, and department suitability to compute a Match Score and recommendation rationale.

function timeToMinutes(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return h * 60 + m;
}

export function isRoomFreeAt(room, conflicts, start, end) {
  if (room.status === 'maintenance' || room.status === 'blocked') return false;
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  const roomConflicts = (conflicts || []).filter((o) => o.room === room.id);
  return !roomConflicts.some((o) => {
    const os = timeToMinutes(o.start);
    const oe = timeToMinutes(o.end);
    return s < oe && os < e;
  });
}

export function getConflict(room, conflicts, start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return (conflicts || []).find((o) => {
    if (o.room !== room.id) return false;
    const os = timeToMinutes(o.start);
    const oe = timeToMinutes(o.end);
    return s < oe && os < e;
  });
}

// Multi-factor weighted smart matching:
// capacity fit 30%, facility match 25%, availability 25%, smart-room 10%, department suitability 10%
export function scoreRoom(room, criteria) {
  const { studentCount = 50, facilities = [], start = '09:00', end = '10:00', smartRequired = false, conflicts = [], department, preferredFloor } = criteria;

  // 1. Capacity score
  let capacityScore = 0;
  const cap = room.capacity || 60;
  if (cap >= studentCount) {
    const slack = cap - studentCount;
    capacityScore = slack <= 12 ? 100 : Math.max(50, 100 - slack * 1.2);
  } else {
    capacityScore = Math.max(0, 100 - (studentCount - cap) * 5);
  }

  // 2. Facilities score
  const requiredFacilities = facilities.length ? facilities : [];
  const roomFacilities = room.facilities || [];
  const matched = requiredFacilities.filter((f) => roomFacilities.includes(f));
  const facilityScore = requiredFacilities.length
    ? Math.round((matched.length / requiredFacilities.length) * 100)
    : 100;

  // 3. Availability score
  const available = room.status === 'available' && isRoomFreeAt(room, conflicts, start, end);
  const availabilityScore = available ? 100 : 0;

  // 4. Smart room score
  const smartScore = smartRequired ? (room.smart ? 100 : 0) : room.smart ? 100 : 85;

  // 5. Department suitability
  const deptScore = department ? (room.department === department ? 100 : 75) : 100;

  // 6. Floor preference
  const floorScore = preferredFloor ? (room.floor === preferredFloor ? 100 : 80) : 100;

  // Total weighted score
  const total = available
    ? Math.round(
        capacityScore * 0.3 +
          facilityScore * 0.25 +
          availabilityScore * 0.25 +
          smartScore * 0.1 +
          deptScore * 0.05 +
          floorScore * 0.05
      )
    : Math.round((capacityScore * 0.35 + facilityScore * 0.35 + smartScore * 0.3) * 0.25);

  // Generate dynamic, human-readable recommendation explanation
  const reasons = [];
  if (capacityScore >= 85) reasons.push(`optimal capacity (${cap} seats for ${studentCount} students)`);
  if (room.smart && smartRequired) reasons.push('smart classroom equipment');
  if (matched.length > 0) reasons.push(`requested facilities (${matched.join(', ')})`);
  if (available) reasons.push(`availability during ${start}–${end}`);
  if (department && room.department === department) reasons.push(`located in ${department} block`);

  let explanation = '';
  if (available && total >= 80) {
    explanation = `Recommended because it matches ${reasons.join(', ')}.`;
  } else if (!available) {
    explanation = `Unavailable due to an overlapping booking or maintenance schedule during ${start}–${end}.`;
  } else {
    explanation = `Alternative option with ${facilityScore}% facility match and capacity of ${cap}.`;
  }

  return {
    room,
    capacityScore: Math.round(capacityScore),
    facilityScore: Math.round(facilityScore),
    availabilityScore: Math.round(availabilityScore),
    smartScore: Math.round(smartScore),
    deptScore: Math.round(deptScore),
    total: Math.round(total),
    available,
    matchedFacilities: matched,
    missingFacilities: requiredFacilities.filter((f) => !roomFacilities.includes(f)),
    explanation,
  };
}

export function rankRooms(rooms, criteria) {
  return rooms
    .map((r) => scoreRoom(r, criteria))
    .sort((a, b) => b.total - a.total);
}
