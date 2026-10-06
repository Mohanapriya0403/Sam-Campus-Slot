// User directory seeded into MongoDB on `npm run db:seed`. Exactly 5 demo
// accounts are seeded for initial inspection; any additional accounts will be
// created dynamically when users sign in with their own accounts or Google SSO.
export const demoUsers = [
  {
    id: 'u1',
    name: 'Dr. Arjun Kumar',
    email: 'faculty@sam.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'CSE',
    avatarColor: '#7F1D1D',
  },
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
  {
    id: 'u3',
    name: 'S. Meena',
    email: 'admin@sam.edu',
    password: 'admin123',
    role: 'admin',
    department: 'General',
    avatarColor: '#16A34A',
  },
  {
    id: 'u4',
    name: 'Dr. Lakshmi Narayanan',
    email: 'lakshmi.narayanan@sam.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'MECH',
    avatarColor: '#2563EB',
  },
  {
    id: 'u5',
    name: 'Dr. R. Rajesh',
    email: 'coordinator@sam.edu',
    password: 'coordinator123',
    role: 'admin',
    department: 'CSE',
    avatarColor: '#0D9488',
  },
];
