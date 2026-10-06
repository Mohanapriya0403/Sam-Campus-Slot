import http from 'http';
import { app } from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/app.js';
import { connectDB } from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/db/connect.js';
import Booking from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/models/Booking.js';

async function request(server, path, { method = 'GET', body = null, headers = {} } = {}) {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}${path}`;

  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return { status: res.status, headers: res.headers, data: json || text };
}

async function runTests() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('--- 1. Testing 5 Real Database Logins ---');
    const testAccounts = [
      { name: 'User 1: Admin (General)', email: 'admin@sam.edu', password: 'admin123', role: 'admin' },
      { name: 'User 2: Academic Coordinator', email: 'coordinator@sam.edu', password: 'coordinator123', role: 'admin' },
      { name: 'User 3: Faculty (CSE)', email: 'faculty@sam.edu', password: 'faculty123', role: 'faculty' },
      { name: 'User 4: Faculty (MECH)', email: 'lakshmi.narayanan@sam.edu', password: 'faculty123', role: 'faculty' },
      { name: 'User 5: Student (CSE)', email: 'student@sam.edu', password: 'student123', role: 'student' },
    ];

    const tokens = {};

    for (const acc of testAccounts) {
      const res = await request(server, '/api/auth/login', {
        method: 'POST',
        body: { email: acc.email, password: acc.password },
      });
      assert(res.status === 200, `${acc.name} login returns 200 OK`);
      assert(!!res.data.token, `${acc.name} JWT generated`);
      assert(res.data.user.role === acc.role, `${acc.name} role is ${acc.role}`);
      assert(!res.data.user.passwordHash, `${acc.name} passwordHash is NOT returned in response`);
      tokens[acc.email] = res.data.token;

      // Test GET /api/auth/me
      const meRes = await request(server, '/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      assert(meRes.status === 200 && meRes.data.user.email === acc.email, `${acc.name} GET /api/auth/me validates session`);
    }

    console.log('\n--- 2. Role-Based Access Control (RBAC) ---');
    // Student trying to access Admin Analytics
    const studentForbidden = await request(server, '/api/analytics', {
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
    });
    assert(studentForbidden.status === 403, 'Student cannot access Admin Analytics (403 Forbidden)');

    // Student trying to access Users list
    const studentUsersForbidden = await request(server, '/api/users', {
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
    });
    assert(studentUsersForbidden.status === 403, 'Student cannot access User Directory (403 Forbidden)');

    // Admin accessing Analytics
    const adminAnalytics = await request(server, '/api/analytics', {
      headers: { Authorization: `Bearer ${tokens['admin@sam.edu']}` },
    });
    assert(adminAnalytics.status === 200, 'Admin can access Analytics (200 OK)');
    assert(adminAnalytics.data.overview.totalUsers >= 5, `Live Analytics shows real totalUsers (${adminAnalytics.data.overview.totalUsers})`);
    assert(adminAnalytics.data.overview.totalClassrooms > 0, `Live Analytics shows totalClassrooms (${adminAnalytics.data.overview.totalClassrooms})`);

    console.log('\n--- 2b. Google & College Institutional Account Authentication ---');
    // Test 1: Sign in with existing student account via college / google route
    const googleExisting = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: 'student@sam.edu' },
    });
    assert(googleExisting.status === 200, 'Google/College auth with existing user returns 200 OK');
    assert(googleExisting.data.token && googleExisting.data.user.email === 'student@sam.edu', 'Returns valid JWT token and student profile');

    // Test 2: Sign in with new college account (auto-creates in MongoDB)
    const newCollegeEmail = `test.student.${Date.now()}@college.edu`;
    const googleNew = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: newCollegeEmail, name: 'Mohan College Tester' },
    });
    assert(googleNew.status === 200, 'Google/College auth creates new student in MongoDB (200 OK)');
    assert(googleNew.data.user.email === newCollegeEmail, 'New account email matches input');
    assert(googleNew.data.user.authProvider === 'google', 'Account marked with authProvider: "google"');
    assert(googleNew.data.needsProfile === true, 'Brand new account correctly flagged needsProfile: true');

    // Test 3: Google auth with wrapped credential object & custom role
    const facultyCollegeEmail = `faculty.${Date.now()}@sam.edu`;
    const googleFaculty = await request(server, '/api/auth/google', {
      method: 'POST',
      body: {
        credential: { email: facultyCollegeEmail, name: 'Dr. New Scholar' },
        role: 'faculty',
        department: 'CSE',
      },
    });
    assert(googleFaculty.status === 200, 'Google/College auth with credential object & faculty role returns 200 OK');
    assert(googleFaculty.data.user.role === 'faculty', 'Assigned role is faculty');
    assert(googleFaculty.data.user.department === 'CSE', 'Assigned department is CSE');
    assert(googleFaculty.data.needsProfile === false, 'needsProfile is false when department provided');

    // Test 4: Empty Google auth body returns 400
    const googleEmpty = await request(server, '/api/auth/google', {
      method: 'POST',
      body: {},
    });
    assert(googleEmpty.status === 400, 'Empty Google/College auth request returns 400 Bad Request');

    // Test 5: NEC College ID login with 2115001@nec.edu.in
    const necLogin = await request(server, '/api/auth/login', {
      method: 'POST',
      body: { email: '2115001@nec.edu.in', password: 'student123', department: 'CSE', year: 'III Year' },
    });
    assert(necLogin.status === 200, 'Login with full NEC email (2115001@nec.edu.in) returns 200 OK');
    assert(necLogin.data.user.email === '2115001@nec.edu.in', 'NEC user email matches');

    // Test 6: NEC College ID login with register number directly (2115001)
    const necRegNoLogin = await request(server, '/api/auth/login', {
      method: 'POST',
      body: { email: '2115001', password: 'student123', department: 'CSE', year: 'III Year' },
    });
    assert(necRegNoLogin.status === 200, 'Login with raw register number (2115001) resolves to NEC account and returns 200 OK');
    assert(necRegNoLogin.data.user.email === '2115001@nec.edu.in', 'NEC user email correctly matched');

    // Test 7: Google / College SSO with NEC domain (regno@nec.edu.in)
    const randomRegNo = `2115${Math.floor(100 + Math.random() * 900)}`;
    const necGoogle = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: `${randomRegNo}@nec.edu.in`, name: `NEC Student ${randomRegNo}` },
    });
    assert(necGoogle.status === 200, `Google/College SSO creates new NEC student ${randomRegNo}@nec.edu.in in MongoDB (200 OK)`);
    assert(necGoogle.data.user.email === `${randomRegNo}@nec.edu.in`, 'Google SSO user email matches NEC domain');

    // Test 8: Google / College SSO with raw register number (e.g. 2115999)
    const rawReg = `2115${Math.floor(100 + Math.random() * 900)}`;
    const necRawRegGoogle = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: rawReg, name: `NEC Student ${rawReg}` },
    });
    assert(necRawRegGoogle.status === 200, `Google/College SSO normalizes raw regno ${rawReg} to @nec.edu.in (200 OK)`);
    assert(necRawRegGoogle.data.user.email === `${rawReg}@nec.edu.in`, 'Google SSO normalized raw regno into @nec.edu.in');

    // Test 9: Staff login with full email (arjun-cse@nec.edu.in)
    const staffLogin = await request(server, '/api/auth/login', {
      method: 'POST',
      body: { email: 'arjun-cse@nec.edu.in', password: 'faculty123' },
    });
    assert(staffLogin.status === 200, 'Staff login with arjun-cse@nec.edu.in returns 200 OK');
    assert(staffLogin.data.user.role === 'faculty', 'Staff account role is faculty');
    assert(staffLogin.data.user.department === 'CSE', 'Staff account department is CSE');

    // Test 10: Staff login with raw identifier (arjun-cse) without @nec.edu.in
    const staffRawLogin = await request(server, '/api/auth/login', {
      method: 'POST',
      body: { email: 'arjun-cse', password: 'faculty123' },
    });
    assert(staffRawLogin.status === 200, 'Staff login with raw ID arjun-cse resolves and returns 200 OK');
    assert(staffRawLogin.data.user.email === 'arjun-cse@nec.edu.in', 'Raw staff ID resolves to arjun-cse@nec.edu.in');

    // Test 11: Google SSO with new staff pattern (name-dept@nec.edu.in)
    const newStaffEmail = `ramesh-it@nec.edu.in`;
    const staffGoogle = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: newStaffEmail },
    });
    assert(staffGoogle.status === 200, 'Google SSO with staff email ramesh-it@nec.edu.in returns 200 OK');
    assert(staffGoogle.data.user.role === 'faculty', 'Auto-assigned role is faculty');
    assert(staffGoogle.data.user.department === 'IT', 'Auto-detected department is IT');
    assert(staffGoogle.data.needsProfile === false, 'needsProfile is false for staff with auto-detected dept');

    // Test 12: Google SSO with raw staff identifier (priya-ece)
    const staffRawGoogle = await request(server, '/api/auth/google', {
      method: 'POST',
      body: { email: 'priya-ece' },
    });
    assert(staffRawGoogle.status === 200, 'Google SSO with raw priya-ece returns 200 OK');
    assert(staffRawGoogle.data.user.email === 'priya-ece@nec.edu.in', 'Normalized to priya-ece@nec.edu.in');
    assert(staffRawGoogle.data.user.role === 'faculty', 'Auto-assigned role is faculty');
    assert(staffRawGoogle.data.user.department === 'ECE', 'Auto-detected department is ECE');

    console.log('\n--- 3. Timetable API & Department Separation ---');
    // CSE III Year timetable
    const cseTimetable = await request(server, '/api/timetable/CSE/III%20Year?batch=B1');
    assert(cseTimetable.status === 200, 'GET /api/timetable/CSE/III Year returns 200 OK');
    assert(!!cseTimetable.data.weeklyTimetable?.Monday, 'CSE III Year timetable contains Monday slots');

    // Uploaded department timetable (MECH II Year - uploaded)
    const mechTimetable = await request(server, '/api/timetable/MECH/II%20Year');
    assert(mechTimetable.status === 200, 'GET /api/timetable/MECH/II Year returns 200 OK with real uploaded MECH data');

    // Unuploaded department timetable (e.g. MECH IV Year - not uploaded)
    const unuploadedTimetable = await request(server, '/api/timetable/MECH/IV%20Year');
    assert(unuploadedTimetable.status === 404, 'GET /api/timetable/MECH/IV Year returns 404 (does NOT fake or copy CSE data)');

    console.log('\n--- 4. Classroom REST API ---');
    const allRooms = await request(server, '/api/classrooms');
    assert(allRooms.status === 200 && allRooms.data.length >= 60, `GET /api/classrooms returns ${allRooms.data.length} rooms`);

    const f12Room = await request(server, '/api/classrooms/F12');
    assert(f12Room.status === 200 && f12Room.data.id === 'F12', 'GET /api/classrooms/F12 returns room details');

    console.log('\n--- 5. Smart Classroom Allocation Engine & Conflict Detection ---');
    // Call Smart Allocate
    const smartRes = await request(server, '/api/bookings/smart-allocate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['faculty@sam.edu']}` },
      body: {
        date: '2026-08-17',
        start: '11:10',
        end: '12:00',
        studentCount: 58,
        department: 'CSE',
        facilities: ['Projector', 'Smart Board'],
        smartRequired: true,
      },
    });
    assert(smartRes.status === 200, 'POST /api/bookings/smart-allocate returns 200 OK');
    assert(!!smartRes.data.best, `Smart allocation returns top recommendation (${smartRes.data.best?.room?.id} with match score ${smartRes.data.best?.total}%)`);
    assert(smartRes.data.best.explanation?.includes('Recommended because'), 'Smart allocation includes recommendation rationale');
    assert(smartRes.data.alternatives?.length > 0, `Smart allocation returns ${smartRes.data.alternatives?.length} ranked alternative rooms`);

    // Clean up any previous test booking for F14 on 2026-08-17
    await Booking.deleteMany({ room: 'F14', date: '2026-08-17' });

    // Create a Booking
    const bookRes = await request(server, '/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['faculty@sam.edu']}` },
      body: {
        room: 'F14',
        date: '2026-08-17',
        start: '14:00',
        end: '15:00',
        purpose: 'Advanced Algorithms Lecture',
      },
    });
    assert(bookRes.status === 201, 'POST /api/bookings creates new booking (201 Created)');

    // Attempt overlapping double booking (Conflict Detection test!)
    const conflictRes = await request(server, '/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['faculty@sam.edu']}` },
      body: {
        room: 'F14',
        date: '2026-08-17',
        start: '14:30',
        end: '15:30',
        purpose: 'Overlapping Session',
      },
    });
    assert(conflictRes.status === 409, 'Conflict detection rejects overlapping booking with 409 Conflict');
    assert(conflictRes.data.alternatives?.length > 0, 'Conflict response provides ranked alternative classrooms');

    // Clean up test booking
    await Booking.deleteMany({ room: 'F14', date: '2026-08-17' });

    console.log('\n--- 6. Notifications & Department Specificity ---');
    const cseNotifs = await request(server, '/api/notifications?department=CSE', {
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
    });
    assert(cseNotifs.status === 200, 'GET /api/notifications?department=CSE returns 200');
    const hasMechOnly = cseNotifs.data.some((n) => n.department === 'MECH');
    assert(!hasMechOnly, 'CSE student does NOT receive MECH department-specific notifications');

    console.log('\n--- 7. MongoDB Recently Accessed Feature ---');
    // POST /api/recent
    const postRecent = await request(server, '/api/recent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
      body: {
        resourceType: 'classroom',
        resourceId: 'F14',
        resourceName: 'F14 Classroom',
        metadata: { floor: 'First Floor' },
      },
    });
    assert(postRecent.status === 201, 'POST /api/recent saves access history in MongoDB');

    // GET /api/recent
    const getRecent = await request(server, '/api/recent', {
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
    });
    assert(getRecent.status === 200, 'GET /api/recent returns 200');
    assert(getRecent.data.length > 0, `GET /api/recent returns ${getRecent.data.length} MongoDB access records`);

    console.log('\n--- 8. Campus Assistant Chatbot (POST /api/chatbot) ---');
    // Test: Next class
    const nextClassChat = await request(server, '/api/chatbot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
      body: { message: 'Where is my next class?' },
    });
    assert(nextClassChat.status === 200, 'POST /api/chatbot next class returns 200');
    assert(nextClassChat.data.reply?.includes('venue'), `Chatbot answers next class correctly: "${nextClassChat.data.reply.slice(0, 65)}..."`);

    // Test: Available at 2 PM
    const freeRoomsChat = await request(server, '/api/chatbot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
      body: { message: 'What classroom is available at 2 PM?' },
    });
    assert(freeRoomsChat.status === 200, 'POST /api/chatbot available rooms returns 200');
    assert(freeRoomsChat.data.reply?.includes('available'), `Chatbot returns available classrooms: "${freeRoomsChat.data.reply.slice(0, 65)}..."`);

    // Test: Smart classrooms
    const smartChat = await request(server, '/api/chatbot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
      body: { message: 'Which smart classrooms are available?' },
    });
    assert(smartChat.status === 200, 'POST /api/chatbot smart classrooms returns 200');
    assert(smartChat.data.reply?.includes('Smart Classrooms'), `Chatbot answers smart rooms: "${smartChat.data.reply.slice(0, 65)}..."`);

    // Test: Venue changes
    const venueChat = await request(server, '/api/chatbot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens['student@sam.edu']}` },
      body: { message: "What are today's venue changes?" },
    });
    assert(venueChat.status === 200, 'POST /api/chatbot venue changes returns 200');
    assert(venueChat.data.reply?.includes('venue change') || venueChat.data.reply?.includes('moved from'), `Chatbot answers venue change: "${venueChat.data.reply.slice(0, 65)}..."`);

    // Section 9: Faculty Dedicated Schedule & Admin Master Schedule
    console.log(`\n--- 9. Role-Specific Timetables (Faculty & Admin) ---`);
    const facRes = await request(server, '/api/timetable/faculty?faculty=Dr.M.C.Eniyan&department=MECH', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens['faculty@sam.edu']}` },
    });
    assert(facRes.status === 200, 'GET /api/timetable/faculty returns 200');
    assert(facRes.data.totalSessions > 0, `Faculty has ${facRes.data.totalSessions} scheduled sessions across week`);
    assert(Array.isArray(facRes.data.venues) && facRes.data.venues.includes('DOM Lab'), 'Faculty schedule contains DOM Lab');
    assert(Array.isArray(facRes.data.weeklySchedule.Wednesday), 'Faculty schedule contains Wednesday lab slots');

    const adminMatrixRes = await request(server, '/api/timetable/admin/matrix?department=CSE&day=Monday', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokens['admin@sam.edu']}` },
    });
    assert(adminMatrixRes.status === 200, 'GET /api/timetable/admin/matrix returns 200');
    assert(Array.isArray(adminMatrixRes.data.matrix), 'Admin matrix returns venue occupancy array');
    assert(adminMatrixRes.data.venuesCount > 0, `Admin matrix reports ${adminMatrixRes.data.venuesCount} venues`);
    assert(adminMatrixRes.data.standardPeriods.length === 7, 'Admin matrix standard 7 periods included');

    console.log(`\n===========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===========================================`);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
