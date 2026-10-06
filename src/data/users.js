// Mock user directory used for demo login. Replace with a real auth service later.
// Department/Year are selected on the Login page itself (not fixed per
// account) — the values below are just the pre-fill defaults for the demo
// student account so a first-time visitor sees real III Year CSE data.
// Deliberately no `batch` here: batch is timetable context, not student
// identity — see AuthContext.jsx and MyTimetable.jsx.
// User directory seeded into MongoDB on `npm run db:seed`. Every account
// here is a real, working login (password hashed with bcrypt at seed time —
// see seedUsers() in db/seed.js) that you can sign in with immediately;
// there is no separate "sample" login layer sitting on top of these.
// Department/Year fields on student accounts are also selected on the
// Login page itself at sign-in time (see Login.jsx) — the values below are
// just each account's own default academic standing.
export const demoUsers = [
  { id: 'u1', name: 'Dr. Arjun Kumar', email: 'faculty@sam.edu', password: 'faculty123', role: 'faculty', department: 'CSE', avatarColor: '#7F1D1D' },
  {
    id: 'u2',
    name: 'Mohanapriya',
    email: 'student@sam.edu',
    password: 'student123',
    role: 'student',
    department: 'CSE',
    year: 'III Year',
    avatarColor: '#EC8A3D',
  },
  { id: 'u3', name: 'S. Meena', email: 'admin@sam.edu', password: 'admin123', role: 'admin', department: 'General', avatarColor: '#16A34A' },
  { id: 'u4', name: 'Dr. Lakshmi Narayanan', email: 'lakshmi.narayanan@sam.edu', password: 'faculty123', role: 'faculty', department: 'MECH', avatarColor: '#2563EB' },
  {
    id: 'u5',
    name: 'Karthik Raja',
    email: 'karthik.raja@sam.edu',
    password: 'student123',
    role: 'student',
    department: 'ECE',
    year: 'III Year',
    avatarColor: '#7C3AED',
  },
  {
    id: 'u6',
    name: 'Divya Shree',
    email: 'divya.shree@sam.edu',
    password: 'student123',
    role: 'student',
    department: 'IT',
    year: 'III Year',
    avatarColor: '#DB2777',
  },
];
