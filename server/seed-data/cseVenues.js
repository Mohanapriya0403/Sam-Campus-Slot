// Venue structure for every department. CSE / MECH / ECE room names/codes are
// the department's actual venue names, as provided. IT / AIDS / CIVIL / EEE /
// S&H didn't come with a room-by-room list, so those follow the campus's own
// "<Dept>-<Floor><Room>" numbering convention (e.g. IT-101 = IT dept, Ground
// floor, room 01) rather than being invented ad hoc — the same shape a real
// facilities database would use for a department whose venues haven't been
// digitised room-by-room yet.

export const CSE_FLOORS = [
  {
    id: 'ground',
    label: 'Ground Floor',
    rooms: [
      { id: 'APJ', smart: false },
      { id: 'CVR', smart: false },
      { id: 'ICL', smart: false },
      { id: 'IBM', smart: false },
      { id: 'RM', smart: false },
      { id: 'CISCO', smart: false },
    ],
  },
  {
    id: 'first',
    label: 'First Floor',
    rooms: [
      { id: 'F7', smart: false },
      { id: 'F8', smart: false },
      { id: 'F9', smart: true },
      { id: 'F12', smart: true },
      { id: 'F14', smart: true },
      { id: 'F15', smart: false },
      { id: 'F16', smart: false },
    ],
  },
  {
    id: 'second',
    label: 'Second Floor',
    rooms: [
      { id: 'S3', smart: false },
      { id: 'S4', smart: false },
      { id: 'S5', smart: true },
      { id: 'S6', smart: false },
      { id: 'Activity Classroom', smart: false, special: 'Activity / Special Purpose Room' },
    ],
  },
];

// Flat list with floor + department attached, used for search/filter/allocation.
export const cseClassrooms = CSE_FLOORS.flatMap((floor) =>
  floor.rooms.map((room) => ({
    id: room.id,
    department: 'CSE',
    floor: floor.label,
    floorId: floor.id,
    smart: room.smart,
    special: room.special || null,
    capacity: room.smart ? 66 : 60,
    facilities: room.smart
      ? ['Projector', 'Smart Board', 'AC', 'Computer', 'Wi-Fi', 'Audio System']
      : ['Projector', 'Wi-Fi'],
    status: 'available',
  }))
);

// MECHANICAL ENGINEERING — real department venue structure, as provided.
// Grouped by function rather than physical floor, since no floor breakdown
// was given for these — "Labs" are the department's dedicated lab rooms,
// "Lecture Halls" are the shared theory classrooms (also the Hall 4 / Hall 5
// batch rooms used in the III Year V Semester timetable).
export const MECH_GROUPS = [
  {
    id: 'labs',
    label: 'Labs',
    rooms: [
      { id: 'Machining Process Lab', smart: false },
      { id: 'Thermal Lab', smart: false },
      { id: 'Strength of Materials Lab', smart: false },
      { id: 'Basic Manufacturing Lab', smart: false },
      { id: 'Metallurgy Lab', smart: false },
      { id: 'Dynamics of Machinery Lab', smart: false },
      { id: 'Fluid Mechanics Lab', smart: false },
      { id: 'COD Lab', smart: false },
      { id: 'Hydraulic Lab', smart: false },
      { id: 'Materials Lab', smart: false },
    ],
  },
  {
    id: 'halls',
    label: 'Lecture Halls',
    rooms: [
      { id: 'Hall 2', smart: false },
      { id: 'Hall 3', smart: false },
      { id: 'Hall 4', smart: false },
      { id: 'Hall 5', smart: false },
      { id: 'Smart Classroom', smart: true },
    ],
  },
];

export const mechClassrooms = MECH_GROUPS.flatMap((group) =>
  group.rooms.map((room) => ({
    id: room.id,
    department: 'MECH',
    floor: group.label,
    floorId: group.id,
    smart: room.smart,
    special: room.special || null,
    // Labs run smaller batch sizes than lecture halls — reflected in capacity.
    capacity: room.smart ? 66 : group.id === 'labs' ? 35 : 60,
    facilities: room.smart
      ? ['Projector', 'Smart Board', 'AC', 'Computer', 'Wi-Fi', 'Audio System']
      : group.id === 'labs'
        ? ['Workbenches', 'Safety Equipment', 'Wi-Fi']
        : ['Projector', 'Wi-Fi'],
    status: 'available',
  }))
);

// ELECTRONICS AND COMMUNICATION ENGINEERING — real venue names, taken directly
// from the III Year timetable's course/venue reference table. Grouped by
// function like MECH's: "Lecture Halls" are the batch-specific theory rooms
// (H12/H13/H14 for Batch I/II/III, plus H24/H25 used by a couple of
// electives), "Labs" are the department's named labs. No room here was
// indicated as a smart classroom in the source, so none is marked smart.
export const ECE_GROUPS = [
  {
    id: 'halls',
    label: 'Lecture Halls',
    rooms: [
      { id: 'H12', smart: false },
      { id: 'H13', smart: false },
      { id: 'H14', smart: false },
      { id: 'H24', smart: false },
      { id: 'H25', smart: false },
    ],
  },
  {
    id: 'labs',
    label: 'Labs',
    rooms: [
      { id: 'DSP Lab', smart: false },
      { id: 'IC Lab', smart: false },
      { id: 'VLSI Lab', smart: false },
    ],
  },
];

export const eceClassrooms = ECE_GROUPS.flatMap((group) =>
  group.rooms.map((room) => ({
    id: room.id,
    department: 'ECE',
    floor: group.label,
    floorId: group.id,
    smart: room.smart,
    special: room.special || null,
    capacity: group.id === 'labs' ? 35 : 60,
    facilities: group.id === 'labs' ? ['Oscilloscopes', 'Workbenches', 'Wi-Fi'] : ['Projector', 'Wi-Fi'],
    status: 'available',
  }))
);

// Departments whose venues follow the campus's standard numbering scheme
// rather than named halls/labs. Two floors, two rooms each — a lecture room
// and a lab per floor — following the same "<Dept>-<Floor><Room>" pattern
// used campus-wide for blocks that don't have named halls/labs.
export const NUMBERED_DEPARTMENTS = ['IT', 'AIDS', 'CIVIL', 'EEE', 'S&H'];

const NUMBERED_DEPT_FLOORS = [
  {
    id: 'ground',
    label: 'Ground Floor',
    rooms: [
      { suffix: '101', kind: 'lecture', smart: false },
      { suffix: '102', kind: 'lab', smart: false },
    ],
  },
  {
    id: 'first',
    label: 'First Floor',
    rooms: [
      { suffix: '201', kind: 'lecture', smart: true },
      { suffix: '202', kind: 'lab', smart: false },
    ],
  },
];

export const numberedDeptClassrooms = NUMBERED_DEPARTMENTS.flatMap((dept) =>
  NUMBERED_DEPT_FLOORS.flatMap((floor) =>
    floor.rooms.map((room) => ({
      id: `${dept}-${room.suffix}`,
      department: dept,
      floor: floor.label,
      floorId: floor.id,
      smart: room.smart,
      special: null,
      capacity: room.kind === 'lab' ? 35 : room.smart ? 66 : 60,
      facilities:
        room.kind === 'lab'
          ? ['Workbenches', 'Wi-Fi']
          : room.smart
            ? ['Projector', 'Smart Board', 'AC', 'Computer', 'Wi-Fi', 'Audio System']
            : ['Projector', 'Wi-Fi'],
      status: 'available',
    }))
  )
);

export const allClassrooms = [...cseClassrooms, ...mechClassrooms, ...eceClassrooms, ...numberedDeptClassrooms];

// Kept in the campus's natural department order for dropdowns/filters.
export const DEPARTMENTS = ['CSE', 'IT', 'AIDS', 'MECH', 'CIVIL', 'EEE', 'ECE', 'S&H'];
export const OTHER_DEPARTMENTS = DEPARTMENTS.slice(1); // back-compat alias, used by a couple of UI filters
export const FACILITIES = ['Projector', 'Smart Board', 'AC', 'Computer', 'Wi-Fi', 'Audio System', 'Workbenches', 'Oscilloscopes', 'Safety Equipment'];

export function isSmartRoom(roomId) {
  return allClassrooms.some((r) => r.id === roomId && r.smart);
}
