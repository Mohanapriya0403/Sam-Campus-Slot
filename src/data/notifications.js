// Every notification is scoped to the department it actually concerns —
// `department: 'ALL'` is reserved for genuinely campus-wide notices (e.g. a
// platform outage) that every department should see. Anything about a
// specific room, timetable, or booking belongs to exactly one department, so
// a CSE student never sees a MECH venue change and vice versa.
export const notifications = [
  { id: 'n1', department: 'CSE', type: 'confirmed', title: 'Classroom Allocated', message: 'F12 booked for 17 Aug, 09:00–10:00 (Theory of Computation).', time: '2h ago', read: false },
  { id: 'n2', department: 'CSE', type: 'room_changed', title: 'Venue Changed', message: 'Object Oriented Analysis and Design moved from F12 to F14 due to maintenance.', time: '5h ago', read: false },
  { id: 'n3', department: 'CSE', type: 'conflict', title: 'Booking Conflict Detected', message: 'ICL was already reserved for your requested slot — alternatives suggested.', time: '1d ago', read: true },
  { id: 'n4', department: 'CSE', type: 'maintenance', title: 'Maintenance Alert', message: 'F12 (Smart Classroom) is under maintenance until 20 Aug.', time: '1d ago', read: true },
  { id: 'n5', department: 'CSE', type: 'cancelled', title: 'Booking Cancelled', message: 'Placement Prep Session in CVR was cancelled.', time: '2d ago', read: true },
  { id: 'n6', department: 'CSE', type: 'schedule', title: 'Timetable Updated', message: 'III Year CSE B1 odd-semester timetable was revised for Friday.', time: '3d ago', read: true },
  { id: 'n7', department: 'MECH', type: 'room_changed', title: 'Venue Changed', message: 'Heat and Mass Transfer (Batch 2) moved from Hall 5 to Hall 4 due to a clash with a placement drive.', time: '3h ago', read: false },
  { id: 'n8', department: 'MECH', type: 'maintenance', title: 'Maintenance Alert', message: 'CADM Lab is closed for equipment servicing on Wednesday.', time: '1d ago', read: true },
  { id: 'n9', department: 'MECH', type: 'schedule', title: 'Timetable Updated', message: 'III Year MECH V-semester timetable was revised for the Saturday IDRA session.', time: '2d ago', read: true },
  { id: 'n11', department: 'CIVIL', type: 'schedule', title: 'Timetable Added', message: 'III Year CIVIL odd-semester timetable is now live on Sam Campus Slot.', time: '6h ago', read: false },
  { id: 'n12', department: 'IT', type: 'schedule', title: 'Timetable Added', message: 'III Year IT odd-semester timetable is now live on Sam Campus Slot.', time: '1h ago', read: false },
  { id: 'n10', department: 'ALL', type: 'confirmed', title: 'Platform Update', message: 'Sam Campus Slot now supports Tamil and Hindi across every page.', time: '4d ago', read: true },
];

/** Notifications a given department should actually see — its own plus any
 * campus-wide ('ALL') notice. A missing department (e.g. admin, who oversees
 * every department) sees everything. */
export function notificationsForDepartment(department) {
  if (!department) return notifications;
  return notifications.filter((n) => n.department === department || n.department === 'ALL');
}

// A dedicated venue-change record per department, used on the student
// "Venue Changed" dashboard card — keyed so a department with no venue
// change today simply shows nothing, rather than falling back to another
// department's notice.
export const venueChangeNoticeByDepartment = {
  CSE: {
    course: 'Object Oriented Analysis and Design',
    oldVenue: 'F12',
    newVenue: 'F14',
    time: '10:05 AM – 10:55 AM',
    reason: 'Classroom maintenance',
  },
  MECH: {
    course: 'Heat and Mass Transfer (Batch 2)',
    oldVenue: 'Hall 5',
    newVenue: 'Hall 4',
    time: '09:15 AM – 10:05 AM',
    reason: 'Clash with a placement drive',
  },
};
