export const weeklyUtilization = [
  { day: 'Mon', utilization: 78 }, { day: 'Tue', utilization: 71 }, { day: 'Wed', utilization: 84 },
  { day: 'Thu', utilization: 76 }, { day: 'Fri', utilization: 69 }, { day: 'Sat', utilization: 35 },
];

export const departmentUtilization = [
  { department: 'CSE', utilization: 85 }, { department: 'IT', utilization: 68 },
  { department: 'AIDS', utilization: 74 }, { department: 'MECH', utilization: 52 },
  { department: 'CIVIL', utilization: 41 }, { department: 'EEE', utilization: 58 },
  { department: 'ECE', utilization: 63 }, { department: 'S&H', utilization: 47 },
];

export const floorUtilization = [
  { floor: 'Ground', utilization: 66 },
  { floor: 'First', utilization: 82 },
  { floor: 'Second', utilization: 59 },
];

export const smartClassroomUsage = [
  { room: 'F9', bookings: 31 }, { room: 'F12', bookings: 44 },
  { room: 'F14', bookings: 27 }, { room: 'S5', bookings: 22 },
];

export const peakHours = [
  { hour: '9AM', bookings: 12 }, { hour: '10AM', bookings: 28 }, { hour: '11AM', bookings: 34 },
  { hour: '12PM', bookings: 20 }, { hour: '2PM', bookings: 25 }, { hour: '3PM', bookings: 30 },
  { hour: '4PM', bookings: 18 }, { hour: '5PM', bookings: 9 },
];

export const roomStatusSplit = [
  { name: 'Available', value: 12, color: '#16A34A' },
  { name: 'Occupied', value: 6, color: '#7F1D1D' },
  { name: 'Maintenance', value: 2, color: '#E63946' },
];

export const mostUsedRooms = [
  { room: 'F12', bookings: 44 }, { room: 'APJ', bookings: 39 }, { room: 'ICL', bookings: 33 },
  { room: 'F14', bookings: 27 }, { room: 'CVR', bookings: 24 },
];

export const leastUsedRooms = [
  { room: 'Activity Classroom', bookings: 4 }, { room: 'IBM', bookings: 6 },
  { room: 'S6', bookings: 7 }, { room: 'F16', bookings: 8 },
];

export const crossDeptBookings = [
  { from: 'ECE', to: 'CSE', count: 14 },
  { from: 'MECH', to: 'CSE', count: 9 },
  { from: 'EEE', to: 'IT', count: 7 },
  { from: 'CIVIL', to: 'CSE', count: 5 },
];
