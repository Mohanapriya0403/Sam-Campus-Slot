import http from 'http';
import { app } from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/app.js';
import { connectDB } from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/db/connect.js';
import User from 'file:///C:/Users/mohan/Downloads/sam-campus-slot-fullstack-mongodb%20(1)/sam-campus-slot/server/src/models/User.js';

async function request(server, path, { method = 'GET', body = null, headers = {} } = {}) {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}${path}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, data: json || text };
}

async function runYear2Tests() {
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
    console.log('--- 1. Testing Demo User Count (Must be exactly 5) ---');
    const userCount = await User.countDocuments();
    assert(userCount === 5, `Expected 5 demo users, found ${userCount}`);

    console.log('\n--- 2. Testing /api/timetable/available ---');
    const availRes = await request(server, '/api/timetable/available');
    assert(availRes.status === 200, 'GET /api/timetable/available returned 200');
    const entries = availRes.data || [];
    const hasCse2 = entries.some((e) => e.department === 'CSE' && e.year === 'II Year');
    const hasIt2 = entries.some((e) => e.department === 'IT' && e.year === 'II Year');
    const hasAids2 = entries.some((e) => (e.department === 'AIDS' || e.department === 'AI&DS') && e.year === 'II Year');
    const hasMech2 = entries.some((e) => e.department === 'MECH' && e.year === 'II Year');
    const hasEce2 = entries.some((e) => e.department === 'ECE' && e.year === 'II Year');
    assert(hasCse2, 'CSE II Year registered in available timetables');
    assert(hasIt2, 'IT II Year registered in available timetables');
    assert(hasAids2, 'AIDS/AI&DS II Year registered in available timetables');
    assert(hasMech2, 'MECH II Year registered in available timetables');
    assert(hasEce2, 'ECE II Year registered in available timetables');

    console.log('\n--- 3. Testing Timetable Meta & Batches for II Year ---');
    const cseMeta = await request(server, '/api/timetable/meta?department=CSE&year=II%20Year');
    assert(cseMeta.data.batches?.length === 3, `CSE II Year has 3 batches: ${JSON.stringify(cseMeta.data.batches)}`);

    const itMeta = await request(server, '/api/timetable/meta?department=IT&year=II%20Year');
    assert(itMeta.data.batches?.length === 2, `IT II Year has 2 batches: ${JSON.stringify(itMeta.data.batches)}`);

    const aidsMeta = await request(server, '/api/timetable/meta?department=AIDS&year=II%20Year');
    assert(aidsMeta.data.batches?.length === 2, `AIDS II Year has 2 batches: ${JSON.stringify(aidsMeta.data.batches)}`);

    const aidsAliasMeta = await request(server, '/api/timetable/meta?department=AI%26DS&year=II%20Year');
    assert(aidsAliasMeta.data.batches?.length === 2, `AI&DS alias II Year has 2 batches: ${JSON.stringify(aidsAliasMeta.data.batches)}`);

    const mechMeta = await request(server, '/api/timetable/meta?department=MECH&year=II%20Year');
    assert(mechMeta.data.batches?.length === 2, `MECH II Year has 2 batches: ${JSON.stringify(mechMeta.data.batches)}`);

    const eceMeta = await request(server, '/api/timetable/meta?department=ECE&year=II%20Year');
    assert(eceMeta.data.batches?.length === 3, `ECE II Year has 3 batches: ${JSON.stringify(eceMeta.data.batches)}`);

    console.log('\n--- 4. Testing CSE II Year Timetable Slots ---');
    const cseB1 = await request(server, '/api/timetable/CSE/II%20Year?batch=B1');
    assert(cseB1.status === 200, 'GET /api/timetable/CSE/II Year?batch=B1 returned 200');
    const cseMonB1 = cseB1.data.weeklyTimetable?.Monday || [];
    assert(cseMonB1[0]?.acronym === 'DS' && cseMonB1[0]?.venue === 'F7', `CSE B1 Mon P1 is DS in F7 (${cseMonB1[0]?.faculty})`);

    const cseB2 = await request(server, '/api/timetable/CSE/II%20Year?batch=B2');
    const cseMonB2 = cseB2.data.weeklyTimetable?.Monday || [];
    assert(cseMonB2[0]?.acronym === 'DS' && cseMonB2[0]?.venue === 'F8', `CSE B2 Mon P1 is DS in F8 (${cseMonB2[0]?.faculty})`);

    const cseB3 = await request(server, '/api/timetable/CSE/II%20Year?batch=B3');
    const cseMonB3 = cseB3.data.weeklyTimetable?.Monday || [];
    assert(cseMonB3[0]?.acronym === 'DS' && cseMonB3[0]?.venue === 'F9', `CSE B3 Mon P1 is DS in F9 (${cseMonB3[0]?.faculty})`);
    assert(cseB1.data.weeklyTimetable?.Saturday?.length > 0, 'CSE II Year includes Saturday schedule (GIV)');

    console.log('\n--- 5. Testing IT II Year Timetable Slots ---');
    const itB1 = await request(server, '/api/timetable/IT/II%20Year?batch=B1');
    assert(itB1.status === 200, 'GET /api/timetable/IT/II Year?batch=B1 returned 200');
    const itMonB1 = itB1.data.weeklyTimetable?.Monday || [];
    assert(itMonB1[0]?.acronym === 'SE', `IT B1 Mon P1 is SE (${itMonB1[0]?.title})`);
    // Check parallel lab split
    const itTueB1 = itB1.data.weeklyTimetable?.Tuesday || [];
    const itB2 = await request(server, '/api/timetable/IT/II%20Year?batch=B2');
    const itTueB2 = itB2.data.weeklyTimetable?.Tuesday || [];
    assert(itTueB1[2]?.label === 'CN LAB' && itTueB1[2]?.venue?.includes('UG LAB II'), `IT B1 Tue P3 is CN LAB in UG LAB II (${itTueB1[2]?.venue})`);
    assert(itTueB2[2]?.label === 'Linux LAB' && itTueB2[2]?.venue?.includes('UG LAB III'), `IT B2 Tue P3 is Linux LAB in UG LAB III (${itTueB2[2]?.venue})`);

    console.log('\n--- 6. Testing AI&DS II Year Timetable Slots ---');
    const aidsB1 = await request(server, '/api/timetable/AIDS/II%20Year?batch=B1');
    assert(aidsB1.status === 200, 'GET /api/timetable/AIDS/II Year?batch=B1 returned 200');
    const aidsMonB1 = aidsB1.data.weeklyTimetable?.Monday || [];
    assert(aidsMonB1[0]?.acronym === 'OOPS', `AIDS B1 Mon P1 is OOPS (${aidsMonB1[0]?.code})`);
    const aidsTueB1 = aidsB1.data.weeklyTimetable?.Tuesday || [];
    const aidsB2 = await request(server, '/api/timetable/AI%26DS/II%20Year?batch=B2');
    assert(aidsB2.status === 200, 'GET /api/timetable/AI&DS/II Year?batch=B2 returned 200 via alias');
    const aidsTueB2 = aidsB2.data.weeklyTimetable?.Tuesday || [];
    assert(aidsTueB1[2]?.label === 'DS Lab' && aidsTueB1[2]?.venue?.includes('DA Lab'), `AIDS B1 Tue P3 is DS Lab in DA Lab (${aidsTueB1[2]?.venue})`);
    assert(aidsTueB2[2]?.label === 'LSA Lab' && aidsTueB2[2]?.venue?.includes('AI Lab'), `AIDS B2 Tue P3 is LSA Lab in AI Lab (${aidsTueB2[2]?.venue})`);

    console.log('\n--- 7. Testing MECH II Year Timetable Slots ---');
    const mechB1 = await request(server, '/api/timetable/MECH/II%20Year?batch=B1');
    assert(mechB1.status === 200, 'GET /api/timetable/MECH/II Year?batch=B1 returned 200');
    const mechMonB1 = mechB1.data.weeklyTimetable?.Monday || [];
    assert(mechMonB1[0]?.acronym === 'EVS', `MECH B1 Mon P1 is EVS`);
    assert(mechMonB1[3]?.acronym === 'ETD' && mechMonB1[3]?.faculty?.includes('Iyahraja'), `MECH B1 Mon P4 is ETD with SIR (${mechMonB1[3]?.faculty})`);
    assert(mechMonB1[5]?.label === 'BMP Lab', `MECH B1 Mon P6 is BMP Lab`);

    const mechB2 = await request(server, '/api/timetable/MECH/II%20Year?batch=B2');
    const mechMonB2 = mechB2.data.weeklyTimetable?.Monday || [];
    assert(mechMonB2[3]?.acronym === 'ETD' && mechMonB2[3]?.faculty?.includes('Eniyan'), `MECH B2 Mon P4 is ETD with Dr.M.C.Eniyan (${mechMonB2[3]?.faculty})`);
    assert(mechMonB2[5]?.label === 'FM Lab', `MECH B2 Mon P6 is FM Lab`);

    console.log('\n--- 8. Testing ECE II Year Timetable Slots ---');
    const eceB1 = await request(server, '/api/timetable/ECE/II%20Year?batch=B1');
    assert(eceB1.status === 200, 'GET /api/timetable/ECE/II Year?batch=B1 returned 200');
    const eceMonB1 = eceB1.data.weeklyTimetable?.Monday || [];
    assert(eceMonB1[0]?.acronym === 'SS' && eceMonB1[0]?.venue === 'H12', `ECE B1 Mon P1 is SS in H12 (${eceMonB1[0]?.faculty})`);
    assert(eceMonB1[1]?.acronym === 'ED' && eceMonB1[1]?.venue === 'H12', `ECE B1 Mon P2 is ED in H12`);
    assert(eceMonB1[5]?.acronym === 'IPR' && eceMonB1[5]?.venue === 'IC Lab', `ECE B1 Mon P7 is IPR Lab in IC Lab`);

    const eceB2 = await request(server, '/api/timetable/ECE/II%20Year?batch=B2');
    const eceMonB2 = eceB2.data.weeklyTimetable?.Monday || [];
    assert(eceMonB2[0]?.acronym === 'SS' && eceMonB2[0]?.venue === 'H13', `ECE B2 Mon P1 is SS in H13 (${eceMonB2[0]?.faculty})`);

    const eceB3 = await request(server, '/api/timetable/ECE/II%20Year?batch=B3');
    const eceMonB3 = eceB3.data.weeklyTimetable?.Monday || [];
    assert(eceMonB3[0]?.acronym === 'SS' && eceMonB3[0]?.venue === 'H14', `ECE B3 Mon P1 is SS in H14 (${eceMonB3[0]?.faculty})`);

    // Verify 3-way Lab Rotations:
    // Tue VII: B1 -> CN Lab, B2 -> DE Lab, B3 -> ED Lab
    const eceTueB1 = eceB1.data.weeklyTimetable?.Tuesday || [];
    const eceTueB2 = eceB2.data.weeklyTimetable?.Tuesday || [];
    const eceTueB3 = eceB3.data.weeklyTimetable?.Tuesday || [];
    assert(eceTueB1[6]?.acronym === 'CN Lab' && eceTueB1[6]?.venue === 'DSP Lab', `ECE B1 Tue P7 is CN Lab in DSP Lab`);
    assert(eceTueB2[6]?.acronym === 'DE Lab' && eceTueB2[6]?.venue === 'IC Lab', `ECE B2 Tue P7 is DE Lab in IC Lab`);
    assert(eceTueB3[6]?.acronym === 'ED Lab' && eceTueB3[6]?.venue === 'IC Lab', `ECE B3 Tue P7 is ED Lab in IC Lab`);

    // Wed III: B1 -> DE Lab, B2 -> ED Lab, B3 -> CN Lab
    const eceWedB1 = eceB1.data.weeklyTimetable?.Wednesday || [];
    const eceWedB2 = eceB2.data.weeklyTimetable?.Wednesday || [];
    const eceWedB3 = eceB3.data.weeklyTimetable?.Wednesday || [];
    assert(eceWedB1[2]?.acronym === 'DE Lab', `ECE B1 Wed P3 is DE Lab`);
    assert(eceWedB2[2]?.acronym === 'ED Lab', `ECE B2 Wed P3 is ED Lab`);
    assert(eceWedB3[2]?.acronym === 'CN Lab', `ECE B3 Wed P3 is CN Lab`);

    // Fri VII: B1 -> ED Lab, B2 -> CN Lab, B3 -> DE Lab
    const eceFriB1 = eceB1.data.weeklyTimetable?.Friday || [];
    const eceFriB2 = eceB2.data.weeklyTimetable?.Friday || [];
    const eceFriB3 = eceB3.data.weeklyTimetable?.Friday || [];
    assert(eceFriB1[6]?.acronym === 'ED Lab', `ECE B1 Fri P7 is ED Lab`);
    assert(eceFriB2[6]?.acronym === 'CN Lab', `ECE B2 Fri P7 is CN Lab`);
    assert(eceFriB3[6]?.acronym === 'DE Lab', `ECE B3 Fri P7 is DE Lab`);

    console.log('\n--- 9. Testing Faculty Schedule for II Year Staff ---');
    const eniyanSchedule = await request(server, '/api/timetable/faculty?faculty=Eniyan&department=MECH');
    assert(eniyanSchedule.status === 200, 'GET /api/timetable/faculty?faculty=Eniyan returned 200');
    assert(eniyanSchedule.data.totalSessions > 0, `Dr. M. C. Eniyan has ${eniyanSchedule.data.totalSessions} scheduled sessions`);

    const manjulaSchedule = await request(server, '/api/timetable/faculty?faculty=Manjula&department=ECE');
    assert(manjulaSchedule.status === 200, 'GET /api/timetable/faculty?faculty=Manjula returned 200');
    assert(manjulaSchedule.data.totalSessions > 0, `Dr. R. Manjula Devi has ${manjulaSchedule.data.totalSessions} scheduled sessions`);

    console.log(`\n===========================================`);
    console.log(`YEAR 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===========================================`);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runYear2Tests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
