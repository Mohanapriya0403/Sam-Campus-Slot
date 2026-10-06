// Backward-compatible aggregate export. The authoritative venue data now lives in
// cseVenues.js (real CSE floors/rooms) — this file re-exports it in the shape older
// pages expect, plus the campus-numbered venues for departments without named halls/labs.
export {
  allClassrooms as classrooms,
  cseClassrooms,
  mechClassrooms,
  MECH_GROUPS,
  eceClassrooms,
  ECE_GROUPS,
  numberedDeptClassrooms,
  numberedDeptClassrooms as placeholderClassrooms,
  CSE_FLOORS,
  DEPARTMENTS,
  OTHER_DEPARTMENTS,
  NUMBERED_DEPARTMENTS,
  FACILITIES,
  isSmartRoom,
} from './cseVenues';

export const BUILDINGS = ['CSE Block', 'IT Block', 'AIDS Block', 'MECH Block', 'CIVIL Block', 'EEE Block', 'ECE Block', 'S&H Block'];
