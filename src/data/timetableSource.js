// III Year CSE — 2026–27 Odd Semester timetable — B1, B2 and B3.
// Rebuilt from the uploaded master time-table grid and the course/venue reference
// table (course acronym, code, title, slot, batch, faculty, venue).
//
// The three batches attend the SAME day + period as one cohort — the master grid
// is one shared weekly skeleton — but each batch is taught in its OWN room by its
// own faculty. That per-batch venue/faculty detail is what `courseDirectory` (below)
// captures exactly as given in the uploaded reference table, and `buildWeeklyGrid()`
// resolves it into a full day-by-day grid for whichever batch is requested. No
// batch is ever hardcoded to one room — the same builder, fed the same skeleton,
// produces a different grid per batch purely from the courseDirectory lookup.
//
// Where the source groups several professional/open electives into one shared
// period (e.g. "SCD/WFP/UI-UX/AiNLP/DE/CEH"), that period is shown as an Elective
// Block listing every course in the bank rather than guessing which one a specific
// student picked — the source document does not record individual elective
// enrolment, and that block is identical for every batch.

export const DEPARTMENT = 'CSE';
export const YEAR = 'III Year';
export const SEMESTER = 'Odd Semester';
export const ACADEMIC_YEAR = '2026–2027';
export const BATCHES = ['B1', 'B2', 'B3'];

export const PERIODS = [
  { id: 'I', start: '09:15', end: '10:05' },
  { id: 'II', start: '10:05', end: '10:55' },
  { id: 'INTERVAL_1', label: 'Interval', start: '10:55', end: '11:10' },
  { id: 'III', start: '11:10', end: '12:00' },
  { id: 'IV', start: '12:00', end: '12:50' },
  { id: 'LUNCH', label: 'Lunch', start: '12:50', end: '13:50' },
  { id: 'V', start: '13:50', end: '14:40' },
  { id: 'VI', start: '14:40', end: '15:30' },
  { id: 'INTERVAL_2', label: 'Interval', start: '15:30', end: '15:45' },
  { id: 'VII', start: '15:45', end: '16:30' },
  { id: 'VIII', start: '16:30', end: '17:15' },
];

const period = (id) => PERIODS.find((p) => p.id === id);

// Shared by CIVIL, IT and AI&DS: these departments' uploaded master grids all
// print the exact same fixed L1–L8 room-rotation pattern (verified across
// every day in each), so one helper serves every weekly grid built below.
const ROOM_ROTATION = {
  MonWedFri: { I: 'L1', II: 'L2', III: 'L3', IV: 'L4', V: 'L7', VI: 'L8', VII: 'L6', VIII: 'L6' },
  TueThu: { I: 'L5', II: 'L6', III: 'L7', IV: 'L8', V: 'L3', VI: 'L4', VII: 'L2', VIII: 'L2' },
};
function roomRotationVenue(day, periodId) {
  const table = ['Monday', 'Wednesday', 'Friday'].includes(day)
    ? ROOM_ROTATION.MonWedFri
    : ['Tuesday', 'Thursday'].includes(day)
    ? ROOM_ROTATION.TueThu
    : null; // day not covered by the uploaded grid (e.g. CIVIL's Saturday) — never guessed
  return table ? table[periodId] || null : null;
}
/** Apply the room-rotation venue to every slot in a weekly grid, merging with
 * any descriptive venue a slot already carries (e.g. IT's "UG Lab I") rather
 * than overwriting it. */
function withRoomRotation(grid) {
  const out = {};
  for (const [day, slots] of Object.entries(grid)) {
    out[day] = slots.map((slot) => {
      const room = roomRotationVenue(day, slot.period.id);
      if (!room) return slot;
      const existing = slot.venue && slot.venue !== '—' ? slot.venue : null;
      return { ...slot, venue: existing ? `${existing} (${room})` : room };
    });
  }
  return out;
}

// ------------------------------------------------------------------------
// COURSE DIRECTORY — the source of truth for code/title/faculty/venue.
// Every venue and faculty name below is copied as-is from the uploaded
// reference table. Nothing here is guessed or reused across departments.
// ------------------------------------------------------------------------
export const courseDirectory = [
  { acronym: 'TOC', code: '23CS51C', title: 'Theory of Computation', batches: [
    { batch: 'B1', faculty: 'Dr.K.Mohaideen Pitchai, Ms.R.Navedha Evanjalin', venue: 'F12' },
    { batch: 'B2', faculty: 'Dr.S.Dheenathayalan, Ms.A.Lincy', venue: 'F15' },
    { batch: 'B3', faculty: 'Ms.D.Thamarai Selvi, Ms.S.Kayathri', venue: 'F14' },
  ]},
  { acronym: 'OOAD', code: '23CS52C', title: 'Object Oriented Analysis and Design', batches: [
    { batch: 'B1', faculty: 'Dr.R.Rajakumari, Asso. Prof/CSE', venue: 'F12' },
    { batch: 'B2', faculty: 'Dr.B.Shunmugapriya, Asso.Prof/CSE (CC)', venue: 'F15' },
    { batch: 'B3', faculty: 'Ms.S.Kayathri, AP/CSE', venue: 'F14' },
  ]},
  { acronym: 'BAD', code: '23CS01E', title: 'Blockchain Architecture and Design', batches: [
    { batch: '—', faculty: 'Dr.S.Dheenathayalan, Asso. Prof/CSE', venue: 'APJ' },
  ]},
  { acronym: 'CG', code: '23CS31E', title: 'Computer Graphics', batches: [
    { batch: '—', faculty: 'Ms.G.Pavithra, AP/CSE', venue: 'CISCO' },
  ]},
  { acronym: 'DM', code: '23CS62E', title: 'Data Mining', batches: [
    { batch: '—', faculty: 'Dr.S.Chidambaram, Asso.Prof/IT', venue: 'UG3/IT' },
  ]},
  { acronym: 'No SQL', code: '23CS12E / 23IT12E', title: 'NoSQL Databases', batches: [
    { batch: 'B1', faculty: 'Mr.K.Rajkumar, AP(SG)/CSE', venue: 'APJ' },
    { batch: 'B2', faculty: 'Ms.M.Kanthimathi, AP/CSE (CC)', venue: 'CVR' },
  ]},
  { acronym: 'CVIP', code: '23CS21E / 23IT21E', title: 'Computer Vision and Image Processing', batches: [
    { batch: 'B1', faculty: 'Ms.D.Thamarai Selvi, AP(SG)/CSE', venue: 'F12' },
    { batch: 'B2', faculty: 'Ms.V.Maheswari, AP/CSE', venue: 'F15' },
  ]},
  { acronym: 'DF', code: '23CS59E', title: 'Digital Forensics', batches: [
    { batch: '—', faculty: 'Dr.R.Muthukkumar, Prof & Head/IT', venue: 'Smart Classroom / IT' },
  ]},
  { acronym: 'DevOps', code: '22CS53C', title: 'DevOps and Agile Methodologies', batches: [
    { batch: 'B1', faculty: 'Mr.K.Rajkumar, AP(SG)/CSE (CC); Ms.V.Maheswari, AP/CSE', venue: 'ICL' },
    { batch: 'B2', faculty: 'Mr.J.Karthikeyan, AP(SG)/CSE; Ms.S.G.Janani Ratthna, AP/CSE', venue: 'CVR' },
    { batch: 'B3', faculty: 'Dr.J.Ida Christy, AP(SG)/CSE; Ms.M.Vaijayanthimala, AP/CSE', venue: 'APJ' },
  ]},
  { acronym: 'MWT', code: '23CS54C', title: 'Modern Web Technologies', batches: [
    { batch: 'B1', faculty: 'Dr.S.Kalaiselvi, Asso. Prof/CSE (CC); Mon – Ms.D.Thamarai Selvi, AP(SG)/CSE; Tue & Thurs – Ms.G.Anitha, AP/CSE', venue: 'APJ' },
    { batch: 'B2', faculty: 'Ms.M.Kanthimathi, AP/CSE; Mon – Mr.K.Rajkumar, AP(SG)/CSE (CC); Tue – Ms.M.N.Rathina Prabha, AP/CSE; Thurs – Dr.B.Shunmugapriya, Asso. Prof/CSE', venue: 'CVR' },
    { batch: 'B3', faculty: 'Ms.T.Rajeswari, AP/CSE; Mon – Ms.A.Lincy, AP/CSE; Tue – Ms.R.Sandhiya, AP/CSE; Thurs – Dr.K.Mohaideen Pitchai, Prof./CSE', venue: 'RM' },
  ]},
  { acronym: 'AI', code: '23CS55C', title: 'Artificial Intelligence', batches: [
    { batch: 'B1', faculty: 'Dr.V.Gomathi, Ms.T.Rajeswari, Mr.J.Karthikeyan', venue: 'APJ' },
    { batch: 'B2', faculty: 'Ms.R.Navedha Evanjalin, Ms.R.Sandhiya', venue: 'ICL' },
    { batch: 'B3', faculty: 'Ms.A.Lincy, Ms.M.Vaijayanthimala', venue: 'CVR' },
  ]},
  { acronym: 'SCD', code: '23CS02E', title: 'Smart Contract and DApp', batches: [
    { batch: '—', faculty: 'Dr.K.Mohaideen Pitchai, Ms.S.Kayathri', venue: 'CVR' },
  ]},
  { acronym: 'DE', code: '23CS63E', title: 'Data Engineering', batches: [
    { batch: '—', faculty: 'Ms.S.Santhi, Ms.D.Thamarai Selvi', venue: 'UG3/IT' },
  ]},
  { acronym: 'WFP', code: '23CS11E / 23IT11E', title: 'Web Frameworks using Python', batches: [
    { batch: 'B1', faculty: 'Mr.D.Vijayakumar, Ms.S.Bagavathi Gayathri', venue: 'APJ' },
    { batch: 'B2', faculty: 'Ms.A.Lincy, Ms.S.Kavitha', venue: 'ICL' },
  ]},
  { acronym: 'UI/UX', code: '23CS32E / 23AD32E', title: 'UI/UX Design', batches: [
    { batch: '—', faculty: 'Ms.R.Vazhan Arul Santhiya, AP/CSE (F12); Ms.M.N.Rathina Prabha, AP/CSE (RM)', venue: 'F12 / RM' },
  ]},
  { acronym: 'AiNLP', code: '23CS23E', title: 'AI Tools for Natural Language Processing', batches: [
    { batch: 'B1 & B2', faculty: 'Dr.S.Rajagopal, Asso. Prof/IT; Ms.R.Suguna, AP/IT; Ms.V.Maheswari, AP/CSE', venue: 'UG1/IT' },
  ]},
  { acronym: 'CEH', code: '23CS56E', title: 'Cyber Security and Ethical Hacking', batches: [
    { batch: '—', faculty: 'Ms.N.Gowthami, AP(SG)/IT; Ms.K.Amsaveni, AP/CSE', venue: 'UG2/IT' },
  ]},
  { acronym: 'SMT', code: '23CS56C', title: 'Simulation using Modern Tools', batches: [
    { batch: 'B1', faculty: 'Mr.K.Rajkumar, AP(SG)/CSE (CC); Thurs – Ms.M.Kanthimathi, AP/CSE; Fri – Ms.K.Amsaveni, AP/CSE', venue: 'RM' },
    { batch: 'B2', faculty: 'Dr.J.Ida Christy, AP(SG)/CSE; Thurs – Ms.D.Thamarai Selvi, AP(SG)/CSE; Fri – Ms.G.Pavithra, AP/CSE', venue: 'CISCO' },
    { batch: 'B3', faculty: 'Ms.A.Rajalakshmi, AP/CSE; Thurs – Dr.D.Manimegalai, Prof/CSE; Fri – Ms.M.N.Rathina Prabha, AP/CSE', venue: 'AI&DL' },
  ]},
  { acronym: 'PDD', code: '23ME20E', title: 'Product Design and Development Strategies', batches: [
    { batch: '—', faculty: 'Dr.S.Kalaiselvi, Asso. Prof/CSE', venue: 'F12' },
  ]},
  { acronym: 'FIoT', code: '23EC47E', title: 'Fundamentals of Internet of Things', batches: [
    { batch: '—', faculty: 'Dr.J.Naskath, Asso.Prof/AI&DS', venue: 'Seminar Hall / AIDS' },
  ]},
  { acronym: 'DPIoT', code: '23EC48E', title: 'Dynamic Paradigms for IoT', batches: [
    { batch: '—', faculty: 'Dr.M.Manimegalai, AP(SG)/IT', venue: 'UG1/IT' },
  ]},
  { acronym: 'FME', code: '23ID04E', title: 'Financial Management for Engineers', batches: [
    { batch: '—', faculty: 'Dr.T.Sakthi, AP(SG)/Mech', venue: 'Civil Dept' },
  ]},
  { acronym: '3D', code: '23ID02E', title: '3D Design and Manufacturing', batches: [
    { batch: '—', faculty: 'Dr.I.Sankar, Asso. Prof/MECH', venue: 'NewGen Block' },
  ]},
  { acronym: 'IDRA', code: '23EC50E', title: 'IoT-Driven Robotics and Automation', batches: [
    { batch: '—', faculty: 'Dr.B.Venkatasamy, Mr.F.Antony Jeffrey Vaz, Dr.M.Kathiresan', venue: 'Project Lab / EEE' },
  ]},
  // Faculty mentor sessions — course table lists these with no venue ('-'), so none is added here.
  { acronym: 'Tutor', code: '—', title: 'Tutor Hour', batches: [
    { batch: '—', faculty: 'Dr.B.Shunmugapriya, Mr.K.Rajkumar, Dr.J.Ida Christy, Ms.R.Navedha Evanjalin, Ms.A.Lincy, Ms.S.G.Janani Ratthna, Ms.A.Rajalakshmi, Ms.R.Santhiya', venue: '—' },
  ]},
];

const courseByAcronym = (acronym) => courseDirectory.find((c) => c.acronym === acronym);

/** Look up the venue + faculty a specific batch sees for a course, straight
 * from courseDirectory. Falls back to a shared ('—') row, or a combined
 * "B1 & B2"-style row, when the course isn't split per batch. Returns null
 * if that batch genuinely has no data for this course (never fabricated). */
function batchInfo(acronym, batch) {
  const entry = courseByAcronym(acronym);
  if (!entry) return null;
  const row =
    entry.batches.find((b) => b.batch === batch) ||
    entry.batches.find((b) => b.batch === '—') ||
    entry.batches.find((b) => b.batch.split('&').map((s) => s.trim()).includes(batch));
  return row ? { venue: row.venue, faculty: row.faculty, code: entry.code, title: entry.title } : null;
}

// title cards for real (non-elective-bank) periods
function courseSlot(acronym, batch) {
  const info = batchInfo(acronym, batch);
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', venue: info?.venue || '—', faculty: info?.faculty || '—' };
}
function labSlot(label, batch, { linkedAcronym, venue, faculty } = {}) {
  const info = linkedAcronym ? batchInfo(linkedAcronym, batch) : null;
  return { kind: 'lab', label, venue: info?.venue || venue || '—', faculty: info?.faculty || faculty || '—' };
}
function electiveBlock(label, options) {
  return { kind: 'elective', label, options };
}

/**
 * The shared weekly skeleton (which day/period is which type of session) is
 * identical for every batch — B1, B2 and B3 attend at the same time as one
 * cohort. Only the room + faculty differ per batch, resolved live from
 * courseDirectory. This is what "Department + Year + Batch + Day + Period +
 * Course → Venue" means in practice: nothing here is a fixed per-batch room.
 */
function buildWeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...courseSlot('DevOps', batch) },
      { period: period('II'), ...courseSlot('AI', batch) },
      { period: period('III'), ...electiveBlock('Professional Elective', ['SCD', 'WFP', 'UI/UX', 'AiNLP', 'DE', 'CEH']) },
      { period: period('IV'), ...courseSlot('OOAD', batch) },
      { period: period('V'), ...labSlot('AI Lab', batch, { linkedAcronym: 'AI' }) },
      { period: period('VI'), ...labSlot('AI Lab', batch, { linkedAcronym: 'AI' }) },
      { period: period('VII'), ...labSlot('MWT — Experiential Learning', batch, { linkedAcronym: 'MWT' }) },
      { period: period('VIII'), ...labSlot('MWT — Experiential Learning', batch, { linkedAcronym: 'MWT' }) },
    ],
    Tuesday: [
      { period: period('I'), ...electiveBlock('BAD / CG / Skillrack Block', ['BAD', 'CG', 'Skillrack']) },
      { period: period('II'), ...electiveBlock('Professional Elective', ['No SQL', 'CVIP', 'DM', 'DF']) },
      { period: period('III'), ...electiveBlock('Open Elective', ['PDD', 'DPIoT', 'FIoT', 'IDRA', 'FME']) },
      { period: period('IV'), ...courseSlot('TOC', batch) },
      { period: period('V'), ...labSlot('MWT Practical', batch, { linkedAcronym: 'MWT' }) },
      { period: period('VI'), ...labSlot('MWT Practical', batch, { linkedAcronym: 'MWT' }) },
      { period: period('VII'), ...electiveBlock('Professional Elective', ['SCD', 'WFP', 'UI/UX', 'AiNLP', 'DE', 'CEH']) },
      { period: period('VIII'), ...electiveBlock('Professional Elective', ['SCD', 'WFP', 'UI/UX', 'AiNLP', 'DE', 'CEH']) },
    ],
    Wednesday: [
      { period: period('I'), ...courseSlot('TOC', batch) },
      { period: period('II'), ...courseSlot('MWT', batch) },
      { period: period('III'), ...electiveBlock('Professional Elective', ['SCD', 'WFP', 'UI/UX', 'AiNLP', 'DE', 'CEH']) },
      { period: period('IV'), ...courseSlot('OOAD', batch) },
      { period: period('V'), ...electiveBlock('Open Elective', ['PDD', 'DPIoT', 'FIoT', '3D', 'FME']) },
      { period: period('VI'), ...courseSlot('TOC', batch) },
      { period: period('VII'), ...labSlot('DevOps — Experiential Learning', batch, { linkedAcronym: 'DevOps' }) },
      { period: period('VIII'), ...labSlot('DevOps — Experiential Learning', batch, { linkedAcronym: 'DevOps' }) },
    ],
    Thursday: [
      { period: period('I'), ...courseSlot('AI', batch) },
      { period: period('II'), ...courseSlot('SMT', batch) },
      { period: period('III'), ...electiveBlock('BAD / CG / Skillrack Block', ['BAD', 'CG', 'Skillrack']) },
      { period: period('IV'), ...electiveBlock('Professional Elective', ['No SQL', 'CVIP', 'DM', 'DF']) },
      { period: period('V'), ...labSlot('MWT — Experiential Learning', batch, { linkedAcronym: 'MWT' }) },
      { period: period('VI'), ...labSlot('MWT — Experiential Learning', batch, { linkedAcronym: 'MWT' }) },
      { period: period('VII'), ...electiveBlock('Open Elective', ['PDD', 'DPIoT', 'FIoT', '3D', 'FME']) },
      { period: period('VIII'), ...courseSlot('Tutor', batch) },
    ],
    Friday: [
      { period: period('I'), ...courseSlot('OOAD', batch) },
      { period: period('II'), ...electiveBlock('Professional Elective', ['No SQL', 'CVIP', 'DM', 'DF']) },
      { period: period('III'), ...courseSlot('AI', batch) },
      { period: period('IV'), ...courseSlot('TOC', batch) },
      { period: period('V'), ...electiveBlock('BAD / CG / Communication Block', ['BAD', 'CG', 'Communication']) },
      { period: period('VI'), ...courseSlot('SMT', batch) },
      { period: period('VII'), ...courseSlot('SMT', batch) },
      { period: period('VIII'), ...courseSlot('SMT', batch) },
    ],
    Saturday: [
      { period: period('I'), ...labSlot('IDRA — IoT-Driven Robotics and Automation', batch, { linkedAcronym: 'IDRA' }) },
      { period: period('II'), ...labSlot('IDRA — IoT-Driven Robotics and Automation', batch, { linkedAcronym: 'IDRA' }) },
      { period: period('III'), ...electiveBlock('IDRA / 3D Design Block', ['IDRA', '3D']) },
      { period: period('IV'), ...electiveBlock('IDRA / 3D Design Block', ['IDRA', '3D']) },
      // Periods V–VIII are blank in the uploaded master grid — no Saturday afternoon class for III Year CSE.
    ],
  };
}

// One real, fully-populated weekly grid per batch — B1, B2 and B3 — built from
// the SAME skeleton above, each resolving its own venues/faculty from
// courseDirectory. Changing the batch changes courses, faculty, venues and
// periods together, exactly as the source timetable defines them.
export const weeklyTimetableByBatch = {
  B1: buildWeeklyGrid('B1'),
  B2: buildWeeklyGrid('B2'),
  B3: buildWeeklyGrid('B3'),
};

// Backward-compatible named export some older call sites may still import.
export const weeklyTimetableB1 = weeklyTimetableByBatch.B1;

// ==========================================================================
// MECHANICAL ENGINEERING — III Year V Semester (2026–2027), w.e.f 15.06.2026
// National Engineering College, Dept. of Mechanical Engineering.
// Rebuilt the same way as CSE: a course/venue reference table (acronym, code,
// title, batch, instructor) plus a shared weekly skeleton, resolved per batch.
// MECH only runs two batches — Batch 1 and Batch 2 — mapped to B1/B2 here so
// batch labels stay consistent with the rest of the app.
//
// Two things worth flagging from the uploaded Class Room Venue / lab-rotation
// table:
//  1. Split lab periods (e.g. Monday 5–6: one batch → CADM Lab, the other →
//     IoT Lab) give each batch a rotation nickname — "Design Xperts I/II" for
//     the CADM/IoT split, "HMT Innovators I/II" for the HMT/SMT split, and
//     "Dynamizens I/II" for the DOM Lab split. Cross-checking every day
//     confirms "...I" is always Batch 1 and "...II" is always Batch 2. Those
//     nicknames are shown alongside the lab label for reference; the faculty
//     shown is always the real instructor from that lab's own course-
//     directory entry (e.g. CADM Lab's faculty = that batch's CADM
//     instructor), never the nickname itself.
//  2. A few periods (e.g. Thursday VII–VIII, Friday III–IV) are a single
//     lab/elective merged across both periods in the master grid, not two
//     separate ones — that's preserved here rather than splitting them.
// ==========================================================================
export const MECH_SEMESTER = 'V Semester';
const MECH_BATCH_ROOM = { B1: 'Hall 4', B2: 'Hall 5' }; // the fixed classroom per batch (see Class Room Venue table)

export const mechCourseDirectory = [
  { acronym: 'MRE', code: '23ME51C', title: 'Mechatronics and Robotics Engineering', batches: [
    { batch: '—', faculty: 'Dr.D.Vignesh Kumar' },
  ]},
  { acronym: 'HMT', code: '23ME52C', title: 'Heat and Mass Transfer', batches: [
    { batch: 'B1', faculty: 'Mrs.M.Rajeswari' },
    { batch: 'B2', faculty: 'Mr.N.Muthu Saravanan' },
  ]},
  { acronym: 'DOM', code: '23ME53C', title: 'Dynamics of Machinery', batches: [
    { batch: 'B1', faculty: 'Dr.M.C.Eniyan' },
    { batch: 'B2', faculty: 'Dr.F.Michel Thomas Rex' },
  ]},
  { acronym: 'CADM', code: '23ME54C', title: 'Computer Aided Design and Manufacturing', batches: [
    { batch: 'B1', faculty: 'Dr.B.Prince Abraham' },
    { batch: 'B2', faculty: 'Dr.C.Veera Ajay' },
  ]},
  { acronym: 'IoT-Lab', code: '23ME55C', title: 'IoT Laboratory', batches: [
    { batch: '—', faculty: 'Ms.P.Arishenbagam, AP/ECE, Mrs.E.Kirthiga @ Sridevi, AP/ECE' },
  ]},
  { acronym: 'SMT', code: '23ME56C', title: 'Simulation Using Modern Tools', batches: [
    { batch: '—', faculty: 'Dr.A.Andrews, Dr.K.Thoufiq Mohamed' },
  ]},
  // PEC-I bank
  { acronym: 'PPE', code: '23ME01E', title: 'Power Plant Engineering', batches: [{ batch: '—', faculty: 'Mrs.M.Rajeswari' }] },
  { acronym: 'H&P', code: '23ME21E', title: 'Hydraulics and Pneumatics', batches: [{ batch: '—', faculty: 'Dr.K.Manisekar' }] },
  { acronym: 'ISE', code: '23ME45E', title: 'Industrial Safety Engineering', batches: [{ batch: '—', faculty: 'Dr.C.Veera Ajay (Asst.), Dr.D.Venkatkumar' }] },
  // PEC-II bank
  { acronym: 'PDDS', code: '23ME20E', title: 'Product Design and Development Strategies', batches: [{ batch: '—', faculty: 'Mr.S.S.Ananthan' }] },
  { acronym: 'NDE', code: '23ME32E', title: 'Non-Destructive Evaluation', batches: [{ batch: '—', faculty: 'Dr.M.C.Eniyan (Asst.)' }] },
  { acronym: 'AM', code: '23ME35E', title: 'Additive Manufacturing', batches: [{ batch: '—', faculty: 'Dr.R.Harichandran' }] },
  // Additional Open Elective (AOE) bank — same cross-department electives CSE III Year students can also take
  { acronym: 'FIOT', code: '23EC47E', title: 'Fundamentals of Internet of Things', batches: [{ batch: '—', faculty: 'Dr.J.Naskath, Asso. Prof./AIDS' }] },
  { acronym: 'IDRA', code: '23EC50E', title: 'IoT-Driven Robotics and Automation', batches: [{ batch: '—', faculty: 'Dr.B.Venkatasamy, Mr.F.Antony Jeffrey Vaz, Dr.M.Kathiresan' }] },
  { acronym: 'CG', code: '23CS31E', title: 'Computer Graphics', batches: [{ batch: '—', faculty: 'Mrs.G.Pavithra, AP/CSE' }] },
  { acronym: 'FME', code: '23ID04E', title: 'Financial Management for Engineers', batches: [{ batch: '—', faculty: 'Dr.T.Sakthi, AP(SG)/Humn.' }] },
  // Faculty-mentor / self-study sessions the course table lists explicitly, with no fixed venue ('-').
  { acronym: 'GATE', code: '—', title: 'GATE Coaching', batches: [{ batch: '—', faculty: 'Mrs.M.Rajeswari' }] },
  { acronym: 'Skillrack', code: '—', title: 'Skill Rack Practice', batches: [{ batch: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' }] },
  { acronym: 'NPTEL', code: '—', title: 'NPTEL Self-Study', batches: [{ batch: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' }] },
  { acronym: 'Tutor', code: '—', title: 'Tutor Hour', batches: [{ batch: '—', faculty: 'Mr.N.Muthu Saravanan (CI), Dr.A.Andrews, Dr.M.C.Eniyan' }] },
];

const mechCourseByAcronym = (acronym) => mechCourseDirectory.find((c) => c.acronym === acronym);
function mechBatchInfo(acronym, batch) {
  const entry = mechCourseByAcronym(acronym);
  if (!entry) return null;
  const row = entry.batches.find((b) => b.batch === batch) || entry.batches.find((b) => b.batch === '—');
  return row ? { faculty: row.faculty, code: entry.code, title: entry.title } : null;
}
// MRE/HMT/DOM/CADM theory happens in the batch's own fixed classroom (Hall 4 /
// Hall 5) — MECH doesn't split venues per course the way CSE does.
function mechTheory(acronym, batch) {
  const info = mechBatchInfo(acronym, batch);
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', venue: MECH_BATCH_ROOM[batch] || '—', faculty: info?.faculty || '—' };
}
function mechElective(label, options) {
  return { kind: 'elective', label, options };
}
/** A lab/activity period where Batch 1 and Batch 2 do two DIFFERENT things in
 * parallel (e.g. Monday 5–6: Batch 1 → CADM Lab, Batch 2 → IoT Lab), exactly
 * as the uploaded Class Room Venue / lab-rotation table lists it. Faculty is
 * pulled from the SAME course-directory entry the linked theory course uses
 * (e.g. CADM Lab faculty = that batch's CADM instructor) — never a separate
 * guess. `nickname` is the lab-rotation group name the uploaded venue table
 * gives each batch for that specific lab (e.g. "Design Xperts I") — shown
 * alongside the label for reference, not used as faculty. */
function mechSplit(batch, { B1, B2 }) {
  const pick = batch === 'B2' ? B2 : B1;
  const info = pick.linkedAcronym ? mechBatchInfo(pick.linkedAcronym, batch) : null;
  const label = pick.nickname ? `${pick.label} (${pick.nickname})` : pick.label;
  return { kind: 'lab', label, venue: pick.venue, faculty: info?.faculty || pick.faculty || '—' };
}
function mechLab(label, venue, faculty = '—') {
  return { kind: 'lab', label, venue, faculty };
}

function buildMechWeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...mechTheory('HMT', batch) },
      { period: period('II'), ...mechTheory('MRE', batch) },
      { period: period('III'), ...mechTheory('DOM', batch) },
      { period: period('IV'), ...mechTheory('CADM', batch) },
      { period: period('V'), ...mechSplit(batch, {
        B1: { label: 'CADM Lab', venue: 'CADM Lab', linkedAcronym: 'CADM', nickname: 'Design Xperts I' },
        B2: { label: 'IoT Lab', venue: 'IoT Lab / Embedded Lab, ECE Dept', linkedAcronym: 'IoT-Lab', nickname: 'Design Xperts II' },
      }) },
      { period: period('VI'), ...mechSplit(batch, {
        B1: { label: 'CADM Lab', venue: 'CADM Lab', linkedAcronym: 'CADM', nickname: 'Design Xperts I' },
        B2: { label: 'IoT Lab', venue: 'IoT Lab / Embedded Lab, ECE Dept', linkedAcronym: 'IoT-Lab', nickname: 'Design Xperts II' },
      }) },
      { period: period('VII'), ...mechSplit(batch, {
        B1: { label: 'HMT Lab', venue: 'HMT Lab', linkedAcronym: 'HMT', nickname: 'HMT Innovators I' },
        B2: { label: 'SMT Lab', venue: 'SMT Lab', linkedAcronym: 'SMT', nickname: 'HMT Innovators II' },
      }) },
      { period: period('VIII'), ...mechSplit(batch, {
        B1: { label: 'HMT Lab', venue: 'HMT Lab', linkedAcronym: 'HMT', nickname: 'HMT Innovators I' },
        B2: { label: 'SMT Lab', venue: 'SMT Lab', linkedAcronym: 'SMT', nickname: 'HMT Innovators II' },
      }) },
    ],
    Tuesday: [
      { period: period('I'), ...mechElective('AOE-CG / GATE', ['CG', 'GATE']) },
      { period: period('II'), ...mechTheory('MRE', batch) },
      { period: period('III'), ...mechElective('Additional Open Elective', ['FIOT', 'IDRA', 'FME', 'NPTEL']) },
      { period: period('IV'), ...mechElective('PEC-I', ['PPE', 'H&P', 'ISE']) },
      { period: period('V'), ...mechLab('Tutor', '—', 'Mr.N.Muthu Saravanan, Dr.A.Andrews, Dr.M.C.Eniyan') },
      { period: period('VI'), ...mechElective('PEC-II', ['PDDS', 'NDE', 'AM']) },
      { period: period('VII'), ...mechSplit(batch, {
        B1: { label: 'SMT Lab', venue: 'SMT Lab', linkedAcronym: 'SMT', nickname: 'HMT Innovators I' },
        B2: { label: 'HMT Lab', venue: 'HMT Lab', linkedAcronym: 'HMT', nickname: 'HMT Innovators II' },
      }) },
      { period: period('VIII'), ...mechSplit(batch, {
        B1: { label: 'SMT Lab', venue: 'SMT Lab', linkedAcronym: 'SMT', nickname: 'HMT Innovators I' },
        B2: { label: 'HMT Lab', venue: 'HMT Lab', linkedAcronym: 'HMT', nickname: 'HMT Innovators II' },
      }) },
    ],
    Wednesday: [
      { period: period('I'), ...mechElective('PEC-I', ['PPE', 'H&P', 'ISE']) },
      { period: period('II'), ...mechElective('PEC-II', ['PDDS', 'NDE', 'AM']) },
      { period: period('III'), ...mechSplit(batch, {
        B1: { label: 'DOM Lab', venue: 'DOM Lab', linkedAcronym: 'DOM', nickname: 'Dynamizens I' },
        B2: { label: 'Skill Rack / NPTEL', venue: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' },
      }) },
      { period: period('IV'), ...mechSplit(batch, {
        B1: { label: 'DOM Lab', venue: 'DOM Lab', linkedAcronym: 'DOM', nickname: 'Dynamizens I' },
        B2: { label: 'Skill Rack / NPTEL', venue: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' },
      }) },
      { period: period('V'), ...mechElective('Additional Open Elective', ['FIOT', 'FME', 'NPTEL']) },
      { period: period('VI'), ...mechTheory('HMT', batch) },
      { period: period('VII'), ...mechSplit(batch, {
        B1: { label: 'IoT Lab', venue: 'IoT Lab / Embedded Lab, ECE Dept', linkedAcronym: 'IoT-Lab', nickname: 'Design Xperts I' },
        B2: { label: 'CADM Lab', venue: 'CADM Lab', linkedAcronym: 'CADM', nickname: 'Design Xperts II' },
      }) },
      { period: period('VIII'), ...mechSplit(batch, {
        B1: { label: 'IoT Lab', venue: 'IoT Lab / Embedded Lab, ECE Dept', linkedAcronym: 'IoT-Lab', nickname: 'Design Xperts I' },
        B2: { label: 'CADM Lab', venue: 'CADM Lab', linkedAcronym: 'CADM', nickname: 'Design Xperts II' },
      }) },
    ],
    Thursday: [
      { period: period('I'), ...mechTheory('DOM', batch) },
      { period: period('II'), ...mechElective('PEC-I', ['PPE', 'H&P', 'ISE']) },
      { period: period('III'), ...mechElective('AOE-CG / GATE', ['CG', 'GATE']) },
      { period: period('IV'), ...mechTheory('HMT', batch) },
      { period: period('V'), ...mechElective('PEC-II', ['PDDS', 'NDE', 'AM']) },
      { period: period('VI'), ...mechTheory('CADM', batch) },
      { period: period('VII'), ...mechElective('Additional Open Elective', ['FIOT', 'FME', 'NPTEL']) },
      { period: period('VIII'), ...mechElective('Additional Open Elective', ['FIOT', 'FME', 'NPTEL']) },
    ],
    Friday: [
      { period: period('I'), ...mechTheory('CADM', batch) },
      { period: period('II'), ...mechTheory('DOM', batch) },
      { period: period('III'), ...mechLab('SMT Lab', 'SMT Lab', 'Dr.A.Andrews, Dr.K.Thoufiq Mohamed') },
      { period: period('IV'), ...mechLab('SMT Lab', 'SMT Lab', 'Dr.A.Andrews, Dr.K.Thoufiq Mohamed') },
      { period: period('V'), ...mechElective('AOE-CG / GATE', ['CG', 'GATE']) },
      { period: period('VI'), ...mechTheory('MRE', batch) },
      { period: period('VII'), ...mechSplit(batch, {
        B1: { label: 'Skill Rack / NPTEL', venue: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' },
        B2: { label: 'DOM Lab', venue: 'DOM Lab', linkedAcronym: 'DOM', nickname: 'Dynamizens II' },
      }) },
      { period: period('VIII'), ...mechSplit(batch, {
        B1: { label: 'Skill Rack / NPTEL', venue: '—', faculty: 'Dr.C.Veera Ajay, Dr.M.C.Eniyan' },
        B2: { label: 'DOM Lab', venue: 'DOM Lab', linkedAcronym: 'DOM', nickname: 'Dynamizens II' },
      }) },
    ],
    Saturday: [
      { period: period('I'), ...mechElective('Additional Open Elective — IoT-Driven Robotics and Automation', ['IDRA']) },
      { period: period('II'), ...mechElective('Additional Open Elective — IoT-Driven Robotics and Automation', ['IDRA']) },
      { period: period('III'), ...mechElective('Additional Open Elective — IoT-Driven Robotics and Automation', ['IDRA']) },
      { period: period('IV'), ...mechElective('Additional Open Elective — IoT-Driven Robotics and Automation', ['IDRA']) },
    ],
  };
}

export const mechWeeklyTimetableByBatch = {
  B1: buildMechWeeklyGrid('B1'),
  B2: buildMechWeeklyGrid('B2'),
};

// ==========================================================================
// ARTIFICIAL INTELLIGENCE AND DATA SCIENCE — III Year V Semester (2026–2027),
// w.e.f 15.06.2026. National Engineering College, Dept. of AI&DS.
// Rebuilt the same way as MECH: a course/faculty reference table plus a
// shared weekly skeleton, resolved per batch. AI&DS runs two batches (B1/B2).
//
// Worth flagging, all straight from the uploaded documents:
//  1. Like CIVIL, THEORY periods are one combined session for both batches,
//     usually co-taught by two instructors listed together (e.g. DL is
//     "Dr.V.Veera Anusuya / Ms.G.Dhivya" for everyone, not split by batch).
//     Only LAB periods actually split the two batches into two different labs
//     running in parallel (e.g. Monday 5–6: Batch 2 → DevOps Lab, Batch 1 →
//     BDA Lab) — that split is modelled the same way MECH's lab split is,
//     with real faculty pulled from that lab's own course-directory entry.
//  2. The master grid prints the same L1–L8 room-rotation codes seen in
//     CIVIL/IT's grids, and — unlike CIVIL — AI&DS's Saturday follows the
//     same rotation as Monday/Wednesday/Friday (confirmed from the printed
//     codes), so Saturday gets real venues too here.
//  3. A few multi-course elective periods bundle acronyms whose exact
//     per-slot venue the source doesn't spell out beyond the shared room
//     code (e.g. "AIforIA/HCA/UI-UX", "PDP/CI" i.e. Product Design and
//     Development + Constitution of India, sharing faculty initials Dr.IS
//     and SR respectively) — these are kept as elective banks listing every
//     option, exactly like every other department's shared-slot electives,
//     rather than guessing which single course a given student attends.
//  4. UI/UX and 3D Design & Manufacturing are cross-listed from CSE/MECH
//     respectively (same course, same instructor, as already recorded in
//     those departments' course directories) — reused here rather than
//     duplicated with different details.
// ==========================================================================
export const AIDS_SEMESTER = 'V Semester';
export const AIDS_BATCHES = ['B1', 'B2'];

export const aidsCourseDirectory = [
  { acronym: 'NLP', code: '23AD51C', title: 'Natural Language Processing', faculty: 'Ms.K.Poorani, AP/AI&DS' },
  // The grid labels this slot "DL" — its faculty (Dr.V.Veera Anusuya / Ms.G.Dhivya)
  // matches 23AD55C Deep Learning exactly, not 23AD51C (Natural Language
  // Processing, taught solely by Ms.K.Poorani, labelled "NLP" elsewhere in the
  // same grid) — so it's recorded here under its real course, not its grid label.
  { acronym: 'DEEP-L', code: '23AD55C', title: 'Deep Learning', faculty: 'Dr.V.Veera Anusuya, AP(SG)/AI&DS; Ms.G.Dhivya, AP/AI&DS', labVenue: 'DL Lab / AI Lab (EL)' },
  { acronym: 'DEVOPS', code: '23AD52C', title: 'DevOps and Agile Methodologies', faculty: 'Ms.P.Swarna Gowsalya, AP/AI&DS; Ms.R.Madhubala, AP/AI&DS', labVenue: 'DA Lab' },
  { acronym: 'BDA', code: '23AD53C', title: 'Big Data Analytics', faculty: 'Ms.K.Poorani, AP/AI&DS; Mr.R.Jeyaseelan, AP/AI&DS', labVenue: 'DL Lab' },
  { acronym: 'EP', code: '23AD54C', title: 'Embedded Programming', faculty: 'Ms.P.Arsishenbagam, AP/AI&DS; Ms.E.Kirthiga, AP/AI&DS', labVenue: 'Embedded Lab' },
  { acronym: 'GENAI', code: '23AD41E', title: 'Generative AI', faculty: 'Dr.V.Kalaivani, Prof & Head/AI&DS; Ms.P.Rampriya, AP/AI&DS' },
  { acronym: 'IVA', code: '23AD64E', title: 'Image and Video Analytics', faculty: 'Ms.N.Subhashini, AP/AI&DS' },
  { acronym: 'AIforIA', code: '23AD42E', title: 'AI for Industrial Applications', faculty: 'Mr.A.Shenbagaraman, AP(SG)/AI&DS' },
  { acronym: 'HCA', code: '23AD65E', title: 'Healthcare Analytics', faculty: 'Ms.R.Madhubala, AP/AI&DS' },
  { acronym: 'UI/UX', code: '23CS32E', title: 'UI/UX Design', faculty: 'Mrs.R.Valan Arul Santhiya, AP/CSE', venue: 'F12 / RM Lab' },
  { acronym: 'CI', code: '23MC01C', title: 'Constitution of India', faculty: 'Ms.S.Renganayaki, AP/AI&DS' },
  { acronym: 'PDD', code: '23ME20E', title: 'Product Design and Development Strategies', faculty: 'Dr.I.Sankar, Asso.Prof/Mech' },
  { acronym: 'IDRA', code: '23EC50E', title: 'IoT-Driven Robotics and Automation', faculty: 'Dr.B.Venkatasamy, AP(SG)/EEE; Mr.F.Antony Jeffrey Vaz, AP/EEE; Dr.M.Kathiresan, Prof/Mech', venue: 'IoT & Robotics Lab (EEE Dept)' },
  { acronym: '3D', code: '23ID02E', title: '3D Design and Manufacturing', faculty: 'Dr.I.Sankar, Asso.Prof/Mech', venue: 'Digital Fabrication Lab (NewGen IEDC)' },
  { acronym: 'SMT', code: '23AD56C', title: 'Simulation using Modern Tools', faculty: 'Mr.A.Shenbaga Raman, AP(SG)/AI&DS; Ms.G.Dhivya, AP/AI&DS; Dr.J.Naskath, Asso.Prof/AI&DS; Ms.R.Madhubala, AP/AI&DS', venue: 'AI Lab' },
  { acronym: 'IDD', code: '23AD41L', title: 'Intelligent Dashboard Development using Modern Tools', faculty: 'Ms.P.Swarna Gowsalya, AP/AI&DS; Ms.S.Renganayaki, AP/AI&DS', venue: 'AI Lab' },
  { acronym: 'SNOWFLAKE', code: '23AD61L', title: 'Data Analytics Using Snowflake', faculty: 'Mr.R.Jeyaseelan, AP/AI&DS; Mr.Ravirathinam Durairaju, Prof. of Practice/AI&DS', venue: 'DA Lab' },
  { acronym: 'AGENTIC-AI', code: '23AD22L', title: 'Agentic AI Tools and Frameworks', faculty: 'Dr.J.Naskath, Asso.Prof/AI&DS; Ms.R.Madhubala, AP/AI&DS', venue: 'DL Lab' },
  { acronym: 'CUDA', code: '23AD23L', title: 'Accelerated AI Development Using CUDA', faculty: 'Ms.M.Saranya, AP/AI&DS; Ms.N.Subhashini, AP/AI&DS', venue: 'AI Lab' },
  { acronym: 'Skillrack', code: '—', title: 'Placement, Skill Rack and Library', faculty: 'Ms.N.Subhashini, Ms.S.Renganayaki, Ms.M.Saranya, AP/AI&DS' },
  { acronym: 'Placement', code: '—', title: 'Placement, Skill Rack and Library', faculty: 'Ms.N.Subhashini, Ms.S.Renganayaki, Ms.M.Saranya, AP/AI&DS' },
  { acronym: 'Library', code: '—', title: 'Placement, Skill Rack and Library', faculty: 'Ms.S.Renganayaki, AP/AI&DS' },
  { acronym: 'Tutor', code: '—', title: 'Tutor Hour', faculty: 'Mr.A.Shenbaga Raman, AP(SG)/AI&DS; Ms.M.Saranya, AP/AI&DS; Ms.N.Subhashini, AP/AI&DS' },
];

const aidsCourseByAcronym = (acronym) => aidsCourseDirectory.find((c) => c.acronym === acronym);
function aidsTheory(acronym) {
  const info = aidsCourseByAcronym(acronym);
  // Deliberately NOT using info.labVenue here — a course's theory period meets
  // in a regular room-rotation slot, not the named lab its practical uses.
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: info?.faculty || '—', venue: info?.venue };
}
function aidsElective(label, options) {
  return { kind: 'elective', label, options };
}
/** A lab period where Batch 1 and Batch 2 run two different labs in parallel
 * — faculty pulled from that lab's own course-directory entry, exactly the
 * pattern used for MECH's split labs. */
function aidsSplit(batch, { B1, B2 }) {
  const pick = batch === 'B2' ? B2 : B1;
  const info = aidsCourseByAcronym(pick.acronym);
  return { kind: 'lab', label: pick.label, venue: info?.labVenue || info?.venue || pick.venue || '—', faculty: info?.faculty || '—' };
}
function aidsLab(label, acronym) {
  const info = aidsCourseByAcronym(acronym);
  return { kind: 'lab', label, venue: info?.labVenue || info?.venue || '—', faculty: info?.faculty || '—' };
}

// Same L1–L8 room-rotation table CIVIL/IT use, but AI&DS's Saturday also
// follows the Mon/Wed/Fri pattern (confirmed from the printed codes), unlike
// CIVIL where Saturday isn't in the uploaded grid at all.
function aidsRoomRotation(day, periodId) {
  const table = ['Monday', 'Wednesday', 'Friday', 'Saturday'].includes(day)
    ? ROOM_ROTATION.MonWedFri
    : ['Tuesday', 'Thursday'].includes(day)
    ? ROOM_ROTATION.TueThu
    : null;
  return table ? table[periodId] || null : null;
}
function withAidsRoomRotation(grid) {
  const out = {};
  for (const [day, slots] of Object.entries(grid)) {
    out[day] = slots.map((slot) => {
      const room = aidsRoomRotation(day, slot.period.id);
      if (!room) return slot;
      const existing = slot.venue && slot.venue !== '—' ? slot.venue : null;
      return { ...slot, venue: existing ? `${existing} (${room})` : room };
    });
  }
  return out;
}

function buildAidsWeeklyGrid(batch) {
  return withAidsRoomRotation({
    Monday: [
      { period: period('I'), ...aidsTheory('DEEP-L') },
      { period: period('II'), ...aidsTheory('BDA') },
      { period: period('III'), ...aidsElective('Professional Elective', ['AIforIA', 'HCA', 'UI/UX']) },
      { period: period('IV'), ...aidsTheory('NLP') },
      { period: period('V'), ...aidsSplit(batch, { B1: { label: 'BDA Lab', acronym: 'BDA' }, B2: { label: 'DevOps Lab', acronym: 'DEVOPS' } }) },
      { period: period('VI'), ...aidsSplit(batch, { B1: { label: 'BDA Lab', acronym: 'BDA' }, B2: { label: 'DevOps Lab', acronym: 'DEVOPS' } }) },
      { period: period('VII'), ...aidsLab('SMT Lab (Experiential)', 'SMT') },
      { period: period('VIII'), ...aidsLab('SMT Lab (Experiential)', 'SMT') },
    ],
    Tuesday: [
      { period: period('I'), ...aidsElective('PDD / Skill Rack Block', ['PDD', 'Skillrack']) },
      { period: period('II'), ...aidsElective('Open Elective', ['GENAI', 'IVA']) },
      { period: period('III'), ...aidsElective('IoT-Driven Robotics / Placement Block', ['IDRA', 'Placement']) },
      { period: period('IV'), ...aidsTheory('BDA') },
      { period: period('V'), ...aidsSplit(batch, { B1: { label: 'EP Lab', acronym: 'EP' }, B2: { label: 'Deep Learning Lab', acronym: 'DEEP-L' } }) },
      { period: period('VI'), ...aidsSplit(batch, { B1: { label: 'EP Lab', acronym: 'EP' }, B2: { label: 'Deep Learning Lab', acronym: 'DEEP-L' } }) },
      { period: period('VII'), ...aidsElective('Professional Elective', ['AIforIA', 'HCA', 'UI/UX']) },
      { period: period('VIII'), ...aidsElective('Professional Elective', ['AIforIA', 'HCA', 'UI/UX']) },
    ],
    Wednesday: [
      { period: period('I'), ...aidsTheory('NLP') },
      { period: period('II'), ...aidsTheory('EP') },
      { period: period('III'), ...aidsElective('Professional Elective', ['AIforIA', 'HCA', 'UI/UX']) },
      { period: period('IV'), ...aidsTheory('Library') },
      { period: period('V'), ...aidsElective('Additional Open Elective', ['3D', 'IDRA', 'Skillrack']) },
      { period: period('VI'), ...aidsTheory('DEEP-L') },
      { period: period('VII'), ...aidsLab('Deep Learning Lab (Experiential)', 'DEEP-L') },
      { period: period('VIII'), ...aidsLab('Deep Learning Lab (Experiential)', 'DEEP-L') },
    ],
    Thursday: [
      { period: period('I'), ...aidsTheory('EP') },
      { period: period('II'), ...aidsTheory('NLP') },
      { period: period('III'), ...aidsElective('PDD / Constitution of India Block', ['PDD', 'CI']) },
      { period: period('IV'), ...aidsElective('Open Elective', ['GENAI', 'IVA']) },
      { period: period('V'), ...aidsSplit(batch, { B1: { label: 'DevOps Lab', acronym: 'DEVOPS' }, B2: { label: 'BDA Lab', acronym: 'BDA' } }) },
      { period: period('VI'), ...aidsSplit(batch, { B1: { label: 'DevOps Lab', acronym: 'DEVOPS' }, B2: { label: 'BDA Lab', acronym: 'BDA' } }) },
      { period: period('VII'), ...aidsElective('Additional Open Elective', ['3D', 'IDRA', 'Skillrack']) },
      { period: period('VIII'), ...aidsTheory('Tutor') },
    ],
    Friday: [
      { period: period('I'), ...aidsTheory('DEVOPS') },
      { period: period('II'), ...aidsElective('Open Elective', ['GENAI', 'IVA']) },
      { period: period('III'), ...aidsSplit(batch, { B1: { label: 'Deep Learning Lab', acronym: 'DEEP-L' }, B2: { label: 'EP Lab', acronym: 'EP' } }) },
      { period: period('IV'), ...aidsSplit(batch, { B1: { label: 'Deep Learning Lab', acronym: 'DEEP-L' }, B2: { label: 'EP Lab', acronym: 'EP' } }) },
      { period: period('V'), ...aidsElective('PDD / Placement Block', ['PDD', 'Placement']) },
      { period: period('VI'), ...aidsTheory('BDA') },
      { period: period('VII'), ...aidsLab('SMT Lab (Experiential)', 'SMT') },
      { period: period('VIII'), ...aidsLab('SMT Lab (Experiential)', 'SMT') },
    ],
    Saturday: [
      { period: period('I'), ...aidsElective('IDD / Data Analytics Using Snowflake Block', ['IDD', 'SNOWFLAKE']) },
      { period: period('II'), ...aidsElective('IDD / Data Analytics Using Snowflake Block', ['IDD', 'SNOWFLAKE']) },
      { period: period('III'), ...aidsElective('Additional Open Elective', ['3D', 'IDRA']) },
      { period: period('IV'), ...aidsElective('Additional Open Elective', ['3D', 'IDRA']) },
      { period: period('V'), ...aidsElective('Agentic AI / Accelerated AI Development (CUDA) Block', ['AGENTIC-AI', 'CUDA']) },
      { period: period('VI'), ...aidsElective('Agentic AI / Accelerated AI Development (CUDA) Block', ['AGENTIC-AI', 'CUDA']) },
      { period: period('VII'), ...aidsLab('SMT Lab', 'SMT') },
      { period: period('VIII'), ...aidsLab('SMT Lab', 'SMT') },
    ],
  });
}

export const aidsWeeklyTimetableByBatch = {
  B1: buildAidsWeeklyGrid('B1'),
  B2: buildAidsWeeklyGrid('B2'),
};

// ==========================================================================
// CIVIL ENGINEERING — III Year Odd Semester (2026–2027), w.e.f 15.06.2026
// National Engineering College, Dept. of Civil Engineering.
// Rebuilt the same way as CSE/MECH from the uploaded course reference table
// (acronym, code, title, faculty) and the master weekly grid.
//
// Two things worth flagging, both straight from the uploaded documents:
//  1. The Batch column in the course reference table reads "Batch 1 & 2" for
//     every core course — CIVIL doesn't run separately-taught sections the
//     way CSE (B1/B2/B3) and MECH (B1/B2) do; both batches sit together in
//     the same room with the same faculty. That's modelled below as two
//     batch keys (B1, B2) that both resolve to the identical weekly grid —
//     never as invented per-batch faculty/venue differences that the source
//     doesn't have.
//  2. The master weekly grid prints a room code under every subject (e.g.
//     "A(L1)") from the department's fixed room-rotation table. Cross-
//     checking every day confirms the room only depends on the day-type and
//     period — Mon/Wed/Fri always run L1,L2,L3,L4,L7,L8,L6 across periods
//     I–VII (VIII reuses VI's room), and Tue/Thu always run
//     L5,L6,L7,L8,L3,L4,L2 the same way — so `roomRotationVenue()` below
//     applies that fixed pattern to every period. The leading letter
//     (A–G) is the room-rotation's internal group label, not something the
//     app needs. Saturday isn't in the uploaded grid at all, so no venue is
//     added there — never guessed.
// A few faculty initials in the master grid (e.g. "SKN", "PSR", "ODF", "NFI",
// "GGF") don't have a clearly matching full name in the reference table at
// the resolution provided; those are kept as the initials themselves rather
// than guessing a name.
// ==========================================================================
export const civilCourseDirectory = [
  { acronym: 'SA', code: '23CE51C', title: 'Structural Analysis', faculty: 'Dr.C.Chellaguru, Asso.Prof/Civil; Mr.V.Anil Kumar, AP/Civil; Mr.V.Radhakrishnan, AP/Civil' },
  { acronym: 'DRC', code: '23CE52C', title: 'Design of Reinforced Concrete Elements', faculty: 'Mr.V.Anil Kumar, AP/Civil; Mr.V.Krishna Sankar, AP/Civil' },
  { acronym: 'FE', code: '23CE55C', title: 'Foundation Engineering', faculty: 'Dr.I.Padmanaban, Prof & Head/Civil; Mr.M.Balamurugan, AP/Civil' },
  { acronym: 'WWE', code: '23CE56C', title: 'Wastewater Engineering', faculty: 'Mr.P.Santhosh Kumar, AP/Civil' },
  { acronym: 'HE', code: '23CE59E', title: 'Highway Engineering', faculty: 'Faculty team — SKN, KBA (per timetable)' },
  { acronym: 'SC', code: '23CE24E', title: 'Smart Cities', faculty: 'Ms.P.Rajapriya, AP/Civil' },
  { acronym: 'PDD', code: '23ME20E', title: 'Product Design and Development Strategies', faculty: 'Faculty team — MBI (per timetable)' },
  { acronym: 'DDL', code: '23CE05E', title: 'Design and Detailing Laboratory', faculty: 'Mr.V.Anil Kumar, Mr.V.Krishna Sankar, Ms.P.Rajapriya' },
  { acronym: 'SIM', code: '—', title: 'Simulation Using Modern Tools', faculty: 'Dr.S.M.Leela Bharathi, Ms.P.Rajapriya' },
  { acronym: 'DRCBM', code: '23CE58E', title: 'Design of Reinforced Concrete and Brick Masonry Structures', faculty: 'Mr.V.Anil Kumar, AP/Civil' },
  { acronym: 'MSW', code: '23CE10E', title: 'Municipal Solid Waste Management', faculty: 'Mr.G.Gagarin, AP/Civil' },
  { acronym: 'RAHE', code: '—', title: 'Railways, Airports and Harbour Engineering', faculty: 'Faculty team — SKN (per timetable)' },
  { acronym: 'FIOT', code: '23EC47E', title: 'Fundamentals of Internet of Things', faculty: 'Dr.J.Naskath, Asso. Prof./AIDS' },
  { acronym: 'IDRA', code: '23EC50E', title: 'IoT-Driven Robotics and Automation', faculty: 'Dr.B.Venkatasamy, Mr.F.Antony Jeffrey Vaz, Dr.M.Kathiresan' },
  { acronym: '3D', code: '23ID02E', title: '3D Design and Manufacturing', faculty: 'Dr.I.Sankar, Asso. Prof./Mech' },
  { acronym: 'FME', code: '23ID04E', title: 'Financial Management for Engineers', faculty: 'Dr.T.Sakthi, AP(SG)' },
];

const civilCourseByAcronym = (acronym) => civilCourseDirectory.find((c) => c.acronym === acronym);
function civilCourse(acronym) {
  const info = civilCourseByAcronym(acronym);
  // venue filled in below by withRoomRotation(), from the master grid's room-rotation table.
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: info?.faculty || '—' };
}
function civilLab(label, acronym) {
  const info = acronym ? civilCourseByAcronym(acronym) : null;
  return { kind: 'lab', label, faculty: info?.faculty || '—' };
}
function civilElective(label, options) {
  return { kind: 'elective', label, options };
}

const civilWeeklyGridRaw = {
  Monday: [
    { period: period('I'), ...civilCourse('HE') },
    { period: period('II'), ...civilCourse('WWE') },
    { period: period('III'), ...civilElective('Vertical — Smart Cities / RAHE', ['SC', 'RAHE']) },
    { period: period('IV'), ...civilCourse('DRC') },
    { period: period('V'), ...civilElective('Vertical — DRCBM / PDD / Library', ['DRCBM', 'PDD']) },
    { period: period('VI'), ...civilCourse('SIM') },
    { period: period('VII'), ...civilLab('SIM Practical / HE Practical', 'SIM') },
    { period: period('VIII'), ...civilLab('SIM Practical / HE Practical', 'SIM') },
  ],
  Tuesday: [
    { period: period('I'), ...civilCourse('SA') },
    { period: period('II'), ...civilCourse('SA') },
    { period: period('III'), ...civilElective('Open Elective / Vertical — MSW / Smart Cities', ['MSW', 'SC']) },
    { period: period('IV'), ...civilCourse('FE') },
    { period: period('V'), ...civilElective('Vertical — MSW / PDD / Library', ['MSW', 'PDD']) },
    { period: period('VI'), ...civilElective('Vertical — Smart Cities / RAHE', ['SC', 'RAHE']) },
    { period: period('VII'), ...civilLab('Smart Cities / Open Elective / Tutor', 'SC') },
    { period: period('VIII'), ...civilLab('Smart Cities / Open Elective / Tutor', 'SC') },
  ],
  Wednesday: [
    { period: period('I'), ...civilCourse('DRC') },
    { period: period('II'), ...civilCourse('SA') },
    { period: period('III'), ...civilCourse('SA') },
    { period: period('IV'), ...civilCourse('FE') },
    { period: period('V'), ...civilLab('SIM Practical / HE Practical', 'SIM') },
    { period: period('VI'), ...civilElective('Smart Cities / Open Elective', ['SC']) },
    { period: period('VII'), ...civilLab('DRCBM / NPTEL', 'DRCBM') },
    { period: period('VIII'), ...civilLab('DRCBM / NPTEL', 'DRCBM') },
  ],
  Thursday: [
    { period: period('I'), ...civilCourse('WWE') },
    { period: period('II'), ...civilCourse('FE') },
    { period: period('III'), ...civilCourse('SA') },
    { period: period('IV'), ...civilElective('Vertical — Smart Cities / RAHE', ['SC', 'RAHE']) },
    { period: period('V'), ...civilElective('Vertical — DRCBM / PDD / Library', ['DRCBM', 'PDD']) },
    { period: period('VI'), ...civilCourse('SIM') },
    { period: period('VII'), ...civilLab('Open Elective / Tutor', null) },
    { period: period('VIII'), ...civilElective('Smart Cities / Open Elective / NPTEL', ['SC']) },
  ],
  Friday: [
    { period: period('I'), ...civilElective('Vertical — Smart Cities / RAHE', ['SC', 'RAHE']) },
    { period: period('II'), ...civilCourse('DRC') },
    { period: period('III'), ...civilElective('Vertical — DRCBM / PDD / Library', ['DRCBM', 'PDD']) },
    { period: period('IV'), ...civilElective('Vertical — DRCBM / PDD / Library', ['DRCBM', 'PDD']) },
    { period: period('V'), ...civilCourse('SA') },
    { period: period('VI'), ...civilElective('Smart Cities / Open Elective', ['SC']) },
    { period: period('VII'), ...civilLab('Open Elective / Skill Rack / Tutor', null) },
    { period: period('VIII'), ...civilLab('Design and Detailing Laboratory (Practical)', 'DDL') },
  ],
  Saturday: [
    { period: period('I'), ...civilElective('Additional Open Elective', ['FIOT', 'IDRA', '3D', 'FME']) },
    { period: period('II'), ...civilElective('Additional Open Elective', ['FIOT', 'IDRA', '3D', 'FME']) },
    { period: period('III'), ...civilElective('Additional Open Elective', ['FIOT', 'IDRA', '3D', 'FME']) },
    { period: period('IV'), ...civilElective('Additional Open Elective', ['FIOT', 'IDRA', '3D', 'FME']) },
  ],
};

const civilWeeklyGrid = withRoomRotation(civilWeeklyGridRaw);

// CIVIL's course table lists every core course as "Batch 1 & 2" — both
// batches sit in the same room with the same faculty, so B1 and B2 both
// resolve to the identical grid rather than inventing a difference the
// source doesn't have.
export const civilWeeklyTimetableByBatch = { B1: civilWeeklyGrid, B2: civilWeeklyGrid };

// ==========================================================================
// INFORMATION TECHNOLOGY — III Year Odd Semester (2026–2027)
// Rebuilt the same way as CIVIL: a clean course reference table (code, title,
// Theory/Practical faculty) plus a weekly skeleton from the master grid.
//
// Worth flagging, all because that's what THIS particular uploaded document
// shows, not an oversight:
//  1. IT runs its own bell schedule — periods start a few minutes later
//     after lunch (V starts 01:50, VII starts 03:40) than CSE/MECH/CIVIL's
//     common timing, so it gets its own IT_PERIODS rather than reusing theirs.
//  2. The course reference table has no Batch column at all — every course
//     lists one faculty team for the whole III Year cohort, not a per-batch
//     split. As with CIVIL, that's modelled as two batch keys (B1, B2) that
//     both resolve to the identical grid, rather than inventing any
//     per-batch faculty/venue difference the source doesn't show.
//  3. The uploaded master grid prints a room code under every period (e.g.
//     "A(L1)"), following the exact same fixed room-rotation pattern as
//     CIVIL's grid (see `roomRotationVenue()` above) — so every period,
//     including every elective/vertical block, now carries a real venue.
//     Lab periods that already had a descriptive room name in the source
//     (e.g. "UG Lab I") keep that name with the room code appended, e.g.
//     "UG Lab I (L7)".
//  4. The uploaded grid only covers Monday–Friday for IT (no Saturday row),
//     unlike CSE/MECH/CIVIL's six-day week — so IT's grid stops at Friday.
// ==========================================================================
export const itCourseDirectory = [
  { acronym: 'PMF', code: '23GN06C', title: 'Project Management and Finance', faculty: 'Dr.T.Sakthi, AP(SG)/Humanities' },
  { acronym: 'CNS', code: '23IT51C', title: 'Cryptography and Network Security', faculty: 'Theory: Dr.R.Muthukkumar (Prof), Mrs.M.Malathi, Mrs.N.Gowthami (Asst.Prof) — Practical: Dr.R.Muthukkumar (Prof), Dr.J.Beno Ranjana (Asst.Prof)' },
  { acronym: 'AI', code: '23IT52C', title: 'Artificial Intelligence', faculty: 'Theory: Mrs.R.Suguna, Mrs.S.Bagavathi Gayathri, Dr.J.Beno Ranjana, Dr.V.Anitha (Asst.Prof) — Practical: Mrs.R.Suguna, Ms.S.Kavitha, Dr.J.Beno Ranjana, Dr.V.Anitha (Asst.Prof)' },
  { acronym: 'MWT', code: '23IT53C', title: 'Modern Web Technologies', faculty: 'Theory: Dr.S.Rajagopal (Asso.Prof), Mrs.S.Santhi (Asst.Prof/SG), Dr.M.Manimegalai — Practical: Mrs.S.Santhi, Ms.S.Kavitha, Mrs.R.Suguna (Asst.Prof)' },
  { acronym: 'No SQL', code: '23IT12E', title: 'NoSQL Databases', faculty: 'Mr.K.Rajkumar, Asst.Prof(SG)/CSE; Ms.M.Kanthimathi, Asst.Prof/CSE' },
  { acronym: 'CVIP', code: '23IT21E', title: 'Computer Vision and Image Processing', faculty: 'Ms.D.Thamarai Selvi, Asst.Prof(SG)/CSE; Ms.V.Maheswari, Asst.Prof/CSE' },
  { acronym: 'GenAI', code: '23IT41E', title: 'Generative AI', faculty: 'Dr.V.Kalaivani, Prof & Head/AI&DS; Ms.M.Rampriya, Asst.Prof/AI&DS' },
  { acronym: 'DM', code: '23IT62E', title: 'Data Mining', faculty: 'Dr.S.Chidambaram, Asst.Prof(SG)' },
  { acronym: 'DF', code: '23IT59E', title: 'Digital Forensics', faculty: 'Dr.R.Muthukkumar, Prof & Head/IT' },
  { acronym: 'AiNLP', code: '23IT23E', title: 'AI Tools for Natural Language Processing', faculty: 'Theory: Dr.S.Rajagopal (Asso.Prof) — Practical: Dr.S.Rajagopal, Mrs.R.Suguna (Asst.Prof), Ms.V.Maheswari, Asst.Prof/CSE' },
  { acronym: 'CEH', code: '23IT56E', title: 'Cyber Security and Ethical Hacking', faculty: 'Theory: Mrs.N.Gowthami (Asst.Prof/SG) — Practical: Mrs.N.Gowthami, Ms.D.Thamarai Selvi, Asst.Prof(SG)/CSE' },
  { acronym: 'DE', code: '23IT63E', title: 'Data Engineering', faculty: 'Theory: Mrs.S.Santhi (Asst.Prof/SG) — Practical: Mrs.S.Santhi, Ms.G.Pavithra, Asst.Prof/CSE' },
  { acronym: 'WFP', code: '23IT11E', title: 'Web Frameworks using Python', faculty: 'Theory: Mr.D.Vijayakumar, Asst.Prof(SG)/CSE — Practical: Mr.D.Vijayakumar/CSE, Ms.A.Lincy/CSE, Mrs.S.Kavitha/IT, Ms.S.Bagavathi Gayathri/IT' },
  { acronym: 'SMT', code: '23IT54C', title: 'Simulation Using Modern Tools', faculty: 'Mrs.N.Gowthami, Asst.Prof(SG); Mrs.S.Kavitha, Asst.Prof' },
  // Cross-listed with other departments' Additional Open Elective banks — same codes/instructors as seen in CSE/MECH/CIVIL.
  { acronym: 'PDD', code: '23ME20E', title: 'Product Design and Development Strategies', faculty: 'Dr.S.Kalaiselvi, Asso. Prof' },
  { acronym: 'DPIoT', code: '23EC48E', title: 'Dynamic Paradigms for IoT', faculty: 'Dr.M.Manimegalai, AP(SG)/IT' },
  { acronym: 'IDRA', code: '23EC50E', title: 'IoT-Driven Robotics and Automation', faculty: 'Dr.B.Venkatasamy, Mr.F.Antony Jeffrey Vaz, Dr.M.Kathiresan' },
];

export const IT_PERIODS = [
  { id: 'I', start: '09:15', end: '10:05' },
  { id: 'II', start: '10:05', end: '10:55' },
  { id: 'INTERVAL_1', label: 'Interval', start: '10:55', end: '11:10' },
  { id: 'III', start: '11:10', end: '12:00' },
  { id: 'IV', start: '12:00', end: '12:50' },
  { id: 'LUNCH', label: 'Lunch', start: '12:55', end: '13:40' },
  { id: 'V', start: '13:50', end: '14:40' },
  { id: 'VI', start: '14:40', end: '15:30' },
  { id: 'INTERVAL_2', label: 'Interval', start: '15:30', end: '15:40' },
  { id: 'VII', start: '15:40', end: '16:30' },
  { id: 'VIII', start: '16:30', end: '17:15' },
];
const itPeriod = (id) => IT_PERIODS.find((p) => p.id === id);

const itCourseByAcronym = (acronym) => itCourseDirectory.find((c) => c.acronym === acronym);
function itCourse(acronym) {
  const info = itCourseByAcronym(acronym);
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: info?.faculty || '—' };
}
function itLab(label, venue, acronym) {
  const info = acronym ? itCourseByAcronym(acronym) : null;
  return { kind: 'lab', label, venue, faculty: info?.faculty || '—' };
}
function itElective(label, options) {
  return { kind: 'elective', label, options };
}

const VERTICAL_I = ['No SQL', 'CVIP', 'GenAI', 'DM', 'DF'];
const VERTICAL_II = ['AiNLP', 'CEH', 'DE', 'WFP', 'SMT'];

const itWeeklyGridRaw = {
  Monday: [
    { period: itPeriod('I'), ...itCourse('AI') },
    { period: itPeriod('II'), ...itCourse('CNS') },
    { period: itPeriod('III'), ...itElective('Vertical - II', VERTICAL_II) },
    { period: itPeriod('IV'), ...itCourse('PMF') },
    { period: itPeriod('V'), ...itLab('CNS Lab', 'UG Lab I', 'CNS') },
    { period: itPeriod('VI'), ...itLab('CNS Lab', 'UG Lab I', 'CNS') },
    { period: itPeriod('VII'), ...itLab('MWT Lab', 'UG Lab II', 'MWT') },
    { period: itPeriod('VIII'), ...itLab('MWT Lab', 'UG Lab II', 'MWT') },
  ],
  Tuesday: [
    { period: itPeriod('I'), ...itElective('Data Mining / Product Design (PDD)', ['DM', 'PDD']) },
    { period: itPeriod('II'), ...itElective('Vertical - I', VERTICAL_I) },
    { period: itPeriod('III'), ...itElective('Additional Open Elective', ['DPIoT', 'IDRA', 'Skill Rack']) },
    { period: itPeriod('IV'), ...itCourse('MWT') },
    { period: itPeriod('V'), ...itLab('SMT / Skill Rack', 'UG Lab I', 'SMT') },
    { period: itPeriod('VI'), ...itLab('SMT / Skill Rack', 'UG Lab I', 'SMT') },
    { period: itPeriod('VII'), ...itElective('Vertical - II Lab', VERTICAL_II) },
    { period: itPeriod('VIII'), ...itElective('Vertical - II Lab', VERTICAL_II) },
  ],
  Wednesday: [
    { period: itPeriod('I'), ...itLab('MWT Lab (parallel sections)', 'UG Lab II / UG Lab III', 'MWT') },
    { period: itPeriod('II'), ...itElective('Vertical - II', VERTICAL_II) },
    { period: itPeriod('III'), ...itCourse('CNS') },
    { period: itPeriod('IV'), ...itElective('Vertical - I', VERTICAL_I) },
    { period: itPeriod('V'), ...itLab('AI Lab', 'UG Lab I', 'AI') },
    { period: itPeriod('VI'), ...itLab('AI Lab', 'UG Lab I', 'AI') },
    { period: itPeriod('VII'), ...itElective('Vertical - II Lab', VERTICAL_II) },
    { period: itPeriod('VIII'), ...itElective('Vertical - II Lab', VERTICAL_II) },
  ],
  Thursday: [
    { period: itPeriod('I'), ...itCourse('CNS') },
    { period: itPeriod('II'), ...itLab('NPTEL Hour', '—', null) },
    { period: itPeriod('III'), ...itElective('Data Mining / Product Design (PDD)', ['DM', 'PDD']) },
    { period: itPeriod('IV'), ...itCourse('AI') },
    { period: itPeriod('V'), ...itLab('SMT / Skill Rack', 'UG Lab I', 'SMT') },
    { period: itPeriod('VI'), ...itLab('SMT / Skill Rack', 'UG Lab I', 'SMT') },
    { period: itPeriod('VII'), ...itElective('Vertical - II', VERTICAL_II) },
    { period: itPeriod('VIII'), ...itLab('Tutor', '—', null) },
  ],
  Friday: [
    { period: itPeriod('I'), ...itCourse('PMF') },
    { period: itPeriod('II'), ...itElective('Vertical - I', VERTICAL_I) },
    { period: itPeriod('III'), ...itLab('MWT Lab (parallel sections)', 'UG Lab II / UG Lab III', 'MWT') },
    { period: itPeriod('IV'), ...itLab('MWT Lab (parallel sections)', 'UG Lab II / UG Lab III', 'MWT') },
    { period: itPeriod('V'), ...itLab('Data Mining / PDD Lab', 'UG Lab I', 'DM') },
    { period: itPeriod('VI'), ...itCourse('AI') },
    { period: itPeriod('VII'), ...itLab('Placement Preparation Hour', '—', null) },
    { period: itPeriod('VIII'), ...itLab('Placement Preparation Hour', '—', null) },
  ],
};

const itWeeklyGrid = withRoomRotation(itWeeklyGridRaw);

// IT's course table has no Batch column at all — the whole III Year cohort
// shares one faculty team and one room per period. Like CIVIL, that's
// modelled as two batch keys (B1, B2) resolving to the identical grid,
// rather than inventing a per-batch difference the source doesn't show.
export const itWeeklyTimetableByBatch = { B1: itWeeklyGrid, B2: itWeeklyGrid };

// ==========================================================================
// ELECTRONICS AND COMMUNICATION ENGINEERING — III Year Odd Semester
// (2026–2027), w.e.f 15.06.2026. National Engineering College, Dept. of ECE.
// Rebuilt the same way as CSE: a course/faculty/venue reference table (real
// named rooms — H12, H13, H14, DSP Lab, IC Lab, VLSI Lab, H24, H25 — not the
// generic L1–L8 rotation CIVIL/IT/AI&DS use) plus a weekly skeleton, resolved
// per batch. ECE runs three batches, listed as I/II/III in the source and
// mapped to B1/B2/B3 here for consistency with the rest of the app.
//
// Worth flagging, all straight from the uploaded documents:
//  1. "CS" in the master grid is Control Systems (23EC51C) — confirmed by
//     matching its faculty initials (VS/RMD/SPM) to Control Systems' three
//     batch instructors (Dr.V.Suresh, Dr.R.Manjula Devi, Mrs.S.Pricilla Mary)
//     and by its slot list (Mon-D, Tue-C, Wed-B(T), Thurs-D) landing on
//     exactly the periods the grid shows "CS" in. Likewise "PHEV" is
//     Professional Ethics and Human Values (23GN05C) — its slot (Tue-F,
//     Fri-B) and faculty both match exactly.
//  2. Digital Communication, Analog Circuits II, and VLSI Design share the
//     same three lab slots each week (Mon 7–8, Wed 7–8, Thu 5–6), and the
//     grid explicitly rotates which batch does which lab each of those days
//     (headed "[I/II/III]" Monday, "[II/III/I]" Wednesday, "[III/I/II]"
//     Thursday) — reproduced here exactly as printed, with each lab's real
//     instructor and room from the course table (DC Lab → Ms.B.Siraj
//     Dowbika, DSP Lab; AC-II Lab → Ms.S.Karthika, IC Lab; VLSI Lab → VLSI
//     Lab, instructor not named in the source).
//  3. A few shared elective/activity blocks (the open-elective bank
//     "SQL/DM/DC/CG/PDP", "SMT", "3D/TUTOR", "CA") list faculty only as
//     initials with no matching name or venue elsewhere in the uploaded
//     table — those initials are kept exactly as printed rather than
//     guessing a full name or room. "CG" in that bank matches CSE's own
//     Computer Graphics instructor (Ms.G.Pavithra) exactly, so that one
//     detail is cross-referenced from CSE's directory rather than repeated.
//  4. The uploaded grid only covers Monday–Friday for ECE (no Saturday row).
// ==========================================================================
export const ECE_BATCHES = ['B1', 'B2', 'B3'];
const ECE_BATCH_LABEL = { B1: 'I', B2: 'II', B3: 'III' }; // source uses Roman numerals I/II/III

export const eceCourseDirectory = [
  { acronym: 'PHEV', code: '23GN05C', title: 'Professional Ethics and Human Values', batches: [
    { batch: 'B1', faculty: 'Mrs.S.Sulochana, AP/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Dr.S.Lavanya, AP/ECE', venue: 'H13' },
    { batch: 'B3', faculty: 'Mrs.G.Akalya Devi, AP/ECE', venue: 'H14' },
  ]},
  { acronym: 'CS', code: '23EC51C', title: 'Control Systems', batches: [
    { batch: 'B1', faculty: 'Mrs.S.Pricilla Mary, AP/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Dr.R.Manjula Devi, AP(SG)/ECE', venue: 'H13' },
    { batch: 'B3', faculty: 'Dr.V.Suresh, Asso.Prof/ECE', venue: 'H14' },
  ]},
  { acronym: 'DC', code: '23EC52C', title: 'Digital Communication', batches: [
    { batch: 'B1', faculty: 'Dr.S.Lavanya, AP/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Dr.S.Tamilselvi, Prof&Head/ECE', venue: 'H13' },
    { batch: 'B3', faculty: 'Mr.B.Ganapathy Ram, AP(SG)/ECE', venue: 'H14' },
  ], lab: { faculty: 'Ms.B.Siraj Dowbika, AP/ECE', venue: 'DSP Lab' } },
  { acronym: 'AC-II', code: '23EC53C', title: 'Analog Circuits II', batches: [
    { batch: 'B1', faculty: 'Dr.T.S.Arun Samuel, Professor/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Dr.I.Vivek Anand, Asso.Prof/ECE', venue: 'H13' },
    { batch: 'B3', faculty: 'Mrs.V.SriRengaNatchiyar, AP/ECE', venue: 'H14' },
  ], lab: { faculty: 'Ms.S.Karthika, AP/ECE', venue: 'IC Lab' } },
  { acronym: 'VLSI', code: '23EC54C', title: 'VLSI Design', batches: [
    { batch: 'B1', faculty: 'Mrs.C.Kalieswari, AP/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Ms.S.Jenet, AP/ECE', venue: 'H13' },
    { batch: 'B3', faculty: 'Mrs.C.K.Balasundari, AP/ECE', venue: 'H14' },
  ], lab: { faculty: '—', venue: 'VLSI Lab' } },
  { acronym: 'DVD', code: '23EC11E', title: 'Digital VLSI System Design', batches: [
    { batch: 'B1', faculty: 'Mrs.C.K.Balasundari, AP/ECE', venue: 'H24' },
    { batch: 'B2', faculty: 'Ms.S.Jenet, AP/ECE', venue: 'H25' },
  ]},
  { acronym: 'RSD', code: '23EC33E', title: 'Radar System Design', batches: [{ batch: '—', faculty: 'Mrs.S.Pricilla Mary, AP/ECE', venue: 'H12' }] },
  { acronym: 'ESRM', code: '23EC05E', title: 'Embedded System Analysis and Risk Management', batches: [{ batch: '—', faculty: 'Mr.T.Devakumar, AP(SG)/ECE', venue: 'H13' }] },
  { acronym: 'POS', code: '23EC40E', title: 'Principles of Operating Systems', batches: [{ batch: '—', faculty: 'Dr.K.Subramanian, AP(SG)/ECE', venue: 'H14' }] },
  { acronym: 'FNE', code: '23EC16E', title: 'Fundamentals to Nano Electronics', batches: [
    { batch: 'B1', faculty: 'Dr.M.Sathishkumar, AP(SG)/ECE', venue: 'H12' },
    { batch: 'B2', faculty: 'Ms.S.Karthika, AP/ECE', venue: 'H24' },
  ]},
  { acronym: 'MEMS', code: '23EC34E', title: 'Introduction to MEMS', batches: [{ batch: '—', faculty: 'Ms.B.Siraj Dowbika, AP/ECE', venue: 'H25' }] },
  { acronym: 'ESA', code: '23EC04E', title: 'Embedded System Architecture', batches: [{ batch: '—', faculty: 'Mr.P.Parthasarathi, AP/ECE', venue: 'H13' }] },
  // Printed in the grid alongside FNE/MEMS/ESA with faculty initial "KJP", but
  // no matching course title, code, or venue appears anywhere in the uploaded
  // table — kept as a bare acronym rather than inventing what it stands for.
  { acronym: 'CNS', code: '—', title: 'CNS', batches: [{ batch: '—', faculty: 'KJP', venue: '—' }] },
  // SMT and CA appear only in the master grid's per-batch faculty breakdown,
  // with no course title, code, or venue in the uploaded table — faculty kept
  // exactly as the initials printed there, per batch (Tue session shown).
  { acronym: 'SMT', code: '—', title: 'Simulation using Modern Tools', batches: [
    { batch: 'B1', faculty: 'GAD, CKB, RMD', venue: '—' },
    { batch: 'B2', faculty: 'SPM, VSRN, PP', venue: '—' },
    { batch: 'B3', faculty: 'TDK, SSA, CK', venue: '—' },
  ]},
  { acronym: 'CA', code: '—', title: 'CA', batches: [{ batch: '—', faculty: 'CK', venue: '—' }] },
];

const eceCourseByAcronym = (acronym) => eceCourseDirectory.find((c) => c.acronym === acronym);
function eceCourse(acronym, batch) {
  const info = eceCourseByAcronym(acronym);
  const bi = info?.batches.find((b) => b.batch === batch) || info?.batches.find((b) => b.batch === '—') || info?.batches[0];
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: bi?.faculty || '—', venue: bi?.venue };
}
function eceLab(acronym, label, batch) {
  const info = eceCourseByAcronym(acronym);
  const bi = batch && info?.batches ? (info.batches.find((b) => b.batch === batch) || info.batches.find((b) => b.batch === '—')) : null;
  return { kind: 'lab', label: label || `${info?.title || acronym} Lab`, faculty: bi?.faculty || info?.lab?.faculty || '—', venue: bi?.venue || info?.lab?.venue || '—' };
}
function eceElective(label, options) {
  return { kind: 'elective', label, options };
}
/** Monday/Wednesday/Thursday: DC, AC-II and VLSI's shared lab slot, with the
 * batch-to-lab pairing rotating exactly as the master grid prints it each day
 * (headed "[I/II/III]" Monday, "[II/III/I]" Wednesday, "[III/I/II]" Thursday). */
function eceLabRotation(batch, order) {
  const acronym = order[batch];
  return eceLab(acronym, `${eceCourseByAcronym(acronym)?.title} Lab`);
}
const ECE_ROTATION_MON = { B1: 'DC', B2: 'AC-II', B3: 'VLSI' };
const ECE_ROTATION_WED = { B1: 'VLSI', B2: 'DC', B3: 'AC-II' };
const ECE_ROTATION_THU = { B1: 'AC-II', B2: 'VLSI', B3: 'DC' };

function buildEceWeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...eceCourse('DC', batch) },
      { period: period('II'), ...eceCourse('AC-II', batch) },
      { period: period('III'), ...eceCourse('VLSI', batch) },
      { period: period('IV'), ...eceCourse('CS', batch) },
      { period: period('V'), ...eceElective('Professional Elective', ['DVD', 'RSD', 'ESRM', 'POS']) },
      { period: period('VI'), ...eceElective('Professional Elective', ['FNE', 'MEMS', 'ESA', 'CNS']) },
      { period: period('VII'), ...eceLabRotation(batch, ECE_ROTATION_MON) },
      { period: period('VIII'), ...eceLabRotation(batch, ECE_ROTATION_MON) },
    ],
    Tuesday: [
      { period: period('I'), ...eceElective('Open Elective', ['SQL', 'DM', 'DC-OE', 'CG', 'PDP']) },
      { period: period('II'), ...eceCourse('CS', batch) },
      { period: period('III'), ...eceCourse('DC', batch) },
      { period: period('IV'), ...eceElective('Professional Elective', ['DVD', 'RSD', 'ESRM', 'POS']) },
      { period: period('V'), ...eceElective('Professional Elective', ['FNE', 'MEMS', 'ESA', 'CNS']) },
      { period: period('VI'), ...eceCourse('PHEV', batch) },
      { period: period('VII'), ...eceLab('SMT', 'Simulation using Modern Tools Lab', batch) },
      { period: period('VIII'), ...eceLab('SMT', 'Simulation using Modern Tools Lab', batch) },
    ],
    Wednesday: [
      { period: period('I'), ...eceCourse('VLSI', batch) },
      { period: period('II'), kind: 'free', label: 'No class scheduled', faculty: null, venue: null },
      { period: period('III'), ...eceCourse('AC-II', batch) },
      { period: period('IV'), ...eceCourse('DC', batch) },
      { period: period('V'), ...eceElective('Open Elective — 3D Design / Computer Applications', ['3D', 'CA']) },
      { period: period('VI'), ...eceCourse('CS', batch), title: 'Control Systems (Tutorial)' },
      { period: period('VII'), ...eceLabRotation(batch, ECE_ROTATION_WED) },
      { period: period('VIII'), ...eceLabRotation(batch, ECE_ROTATION_WED) },
    ],
    Thursday: [
      { period: period('I'), ...eceCourse('CS', batch) },
      { period: period('II'), ...eceCourse('VLSI', batch) },
      { period: period('III'), ...eceElective('Open Elective', ['SQL', 'DM', 'DC-OE', 'CG', 'PDP']) },
      { period: period('IV'), ...eceElective('Open Elective — No SQL Databases', ['SQL']) },
      { period: period('V'), ...eceLabRotation(batch, ECE_ROTATION_THU) },
      { period: period('VI'), ...eceLabRotation(batch, ECE_ROTATION_THU) },
      { period: period('VII'), ...eceElective('Additional Open Elective / Tutor', ['3D', 'Tutor']) },
      { period: period('VIII'), ...eceLab('CA', 'Computer Applications', batch) },
    ],
    Friday: [
      { period: period('I'), ...eceCourse('AC-II', batch) },
      { period: period('II'), ...eceElective('Professional Elective', ['FNE', 'MEMS', 'ESA', 'CNS']) },
      { period: period('III'), ...eceElective('Professional Elective', ['DVD', 'RSD', 'ESRM', 'POS']) },
      { period: period('IV'), ...eceCourse('PHEV', batch) },
      { period: period('V'), ...eceElective('Open Elective', ['SQL', 'DM', 'DC-OE', 'CG', 'PDP']) },
      { period: period('VI'), ...eceLab('CA', 'Computer Applications', batch) },
      { period: period('VII'), ...eceLab('SMT', 'Simulation using Modern Tools Lab', batch) },
      { period: period('VIII'), ...eceLab('SMT', 'Simulation using Modern Tools Lab', batch) },
    ],
  };
}

export const eceWeeklyTimetableByBatch = {
  B1: buildEceWeeklyGrid('B1'),
  B2: buildEceWeeklyGrid('B2'),
  B3: buildEceWeeklyGrid('B3'),
};

// ==========================================================================
// II YEAR (III SEMESTER) TIMETABLES — 2026–2027 ODD SEMESTER
// Transcribed directly from the uploaded departmental timetable documents
// (w.e.f. 15.06.2026, National Engineering College, Kovilpatti).
// ==========================================================================

// --------------------------------------------------------------------------
// 1. ARTIFICIAL INTELLIGENCE & DATA SCIENCE (AI&DS) — II Year / III Semester
// --------------------------------------------------------------------------
export const aidsYear2CourseDirectory = [
  { acronym: 'OS', code: '23AD31C', title: 'Operating Systems', faculty: 'Mr.A.Shenbagaraman, AP(SG)/AI&DS; Ms.S.Renagnayaki, AP/AI&DS' },
  { acronym: 'DWDM', code: '23AD32C', title: 'Data Warehousing and Data Mining', faculty: 'Dr.V.Veera Anusuya, AP(SG)/AI&DS; Mr.R.Jeyaseelan, AP/AI&DS' },
  { acronym: 'MATHS', code: '23AD33C', title: 'Linear Algebra', faculty: 'Ms.S.S.Basitha Parveen, AP/S&H; Ms.V.Vinisha, AP/S&H' },
  { acronym: 'OOPS', code: '23AD34C', title: 'Object Oriented Programming with Java', faculty: 'Dr.J.Naskath, Asso.Prof/AI&DS; Ms.P.Swarna Gowsalya, AP/AI&DS', labVenue: 'DL Lab' },
  { acronym: 'DS', code: '23AD35C', title: 'Data Structures', faculty: 'Ms.M.Saranya, AP/AI&DS; Ms.R.Madhubala, AP/AI&DS', labVenue: 'DA Lab' },
  { acronym: 'AI', code: '23AD36C', title: 'Artificial Intelligence', faculty: 'Ms.P.Rampriya, AP/AI&DS; Ms.G.Dhivya, AP/AI&DS', labVenue: 'AI Lab' },
  { acronym: 'LSA', code: '23AD37C', title: 'Linux System Administration', faculty: 'Mr.A.Shenbagaraman, AP(SG)/AI&DS; Ms.S.Renganayaki, AP/AI&DS', labVenue: 'AI Lab' },
  { acronym: 'IPR', code: '23GN03C', title: 'Intellectual Property Rights Study', faculty: 'Ms.P.Rampriya, AP/AI&DS; Dr.V.Veera Anusuya, AP(SG)/AI&DS; Dr.I.Sankar, Asso.Prof/Mech', labVenue: 'AI Lab' },
  { acronym: 'EVS', code: '23MC02C', title: 'Environmental Science and Engineering', faculty: 'Dr.B.Annaraj, AP(SG)/S&H; Dr.B.Tharmalingam, AP/S&H' },
  { acronym: 'Placement', code: '—', title: 'Placement Training', faculty: 'Ms.P.Rampriya, AP/AI&DS' },
  { acronym: 'Skillrack', code: '—', title: 'Skillrack', faculty: 'Ms.P.Rampriya, AP/AI&DS' },
  { acronym: 'Library', code: '—', title: 'Library Hour', faculty: 'Ms.S.Renganayaki, AP/AI&DS' },
  { acronym: 'TUTOR', code: '—', title: 'Tutor Hour', faculty: 'Ms.K.Poorani, AP/AI&DS; Ms.P.Rampriya, AP/AI&DS; Ms.G.Dhivya, AP/AI&DS' },
];

const aids2CourseByAcronym = (acronym) => aidsYear2CourseDirectory.find((c) => c.acronym === acronym);
function aids2Course(acronym) {
  const info = aids2CourseByAcronym(acronym);
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: info?.faculty || '—' };
}
function aids2Lab(label, acronym, venue) {
  const info = acronym ? aids2CourseByAcronym(acronym) : null;
  return { kind: 'lab', label, acronym: acronym || undefined, code: info?.code || '—', title: info?.title || label, faculty: info?.faculty || '—', venue: venue || info?.labVenue || 'AI Lab' };
}

function buildAidsYear2WeeklyGrid(batch) {
  const isB1 = batch === 'B1';
  return withRoomRotation({
    Monday: [
      { period: period('I'), ...aids2Course('OOPS') },
      { period: period('II'), ...aids2Course('MATHS') },
      { period: period('III'), ...aids2Course('AI') },
      { period: period('IV'), ...aids2Course('DWDM') },
      { period: period('V'), ...aids2Course('OS') },
      { period: period('VI'), ...aids2Course('EVS') },
      { period: period('VII'), ...aids2Course('Placement') },
      { period: period('VIII'), ...aids2Course('Placement') },
    ],
    Tuesday: [
      { period: period('I'), ...aids2Course('DWDM') },
      { period: period('II'), ...aids2Course('MATHS') },
      { period: period('III'), ...(isB1 ? aids2Lab('DS Lab', 'DS', 'DA Lab') : aids2Lab('LSA Lab', 'LSA', 'AI Lab')) },
      { period: period('IV'), ...(isB1 ? aids2Lab('DS Lab', 'DS', 'DA Lab') : aids2Lab('LSA Lab', 'LSA', 'AI Lab')) },
      { period: period('V'), ...aids2Course('DS') },
      { period: period('VI'), ...aids2Course('OS') },
      { period: period('VII'), ...(isB1 ? aids2Lab('OOPS Lab', 'OOPS', 'DL Lab') : aids2Lab('AI Lab', 'AI', 'AI Lab')) },
      { period: period('VIII'), ...(isB1 ? aids2Lab('OOPS Lab', 'OOPS', 'DL Lab') : aids2Lab('AI Lab', 'AI', 'AI Lab')) },
    ],
    Wednesday: [
      { period: period('I'), ...aids2Course('MATHS') },
      { period: period('II'), ...aids2Course('AI') },
      { period: period('III'), ...aids2Course('OOPS') },
      { period: period('IV'), ...aids2Course('TUTOR') },
      { period: period('V'), ...(isB1 ? aids2Lab('LSA Lab', 'LSA', 'AI Lab') : aids2Lab('DS Lab', 'DS', 'DA Lab')) },
      { period: period('VI'), ...(isB1 ? aids2Lab('LSA Lab', 'LSA', 'AI Lab') : aids2Lab('DS Lab', 'DS', 'DA Lab')) },
      { period: period('VII'), ...aids2Course('Placement') },
      { period: period('VIII'), ...aids2Course('Placement') },
    ],
    Thursday: [
      { period: period('I'), ...aids2Course('AI') },
      { period: period('II'), ...aids2Course('DWDM') },
      { period: period('III'), ...aids2Course('DS') },
      { period: period('IV'), ...aids2Course('OOPS') },
      { period: period('V'), ...aids2Lab('IPR Study Lab', 'IPR', 'AI Lab') },
      { period: period('VI'), ...aids2Lab('IPR Study Lab', 'IPR', 'AI Lab') },
      { period: period('VII'), ...aids2Lab('IPR Study Lab', 'IPR', 'AI Lab') },
      { period: period('VIII'), ...aids2Lab('IPR Study Lab', 'IPR', 'AI Lab') },
    ],
    Friday: [
      { period: period('I'), ...aids2Course('OS') },
      { period: period('II'), ...aids2Course('DS') },
      { period: period('III'), ...aids2Course('MATHS') },
      { period: period('IV'), ...aids2Course('EVS') },
      { period: period('V'), ...(isB1 ? aids2Lab('AI Lab', 'AI', 'AI Lab') : aids2Lab('OOPS Lab', 'OOPS', 'DL Lab')) },
      { period: period('VI'), ...(isB1 ? aids2Lab('AI Lab', 'AI', 'AI Lab') : aids2Lab('OOPS Lab', 'OOPS', 'DL Lab')) },
      { period: period('VII'), ...aids2Course('Skillrack') },
      { period: period('VIII'), ...aids2Course('Library') },
    ],
  });
}

export const aidsYear2WeeklyTimetableByBatch = {
  B1: buildAidsYear2WeeklyGrid('B1'),
  B2: buildAidsYear2WeeklyGrid('B2'),
};

// --------------------------------------------------------------------------
// 2. INFORMATION TECHNOLOGY (IT) — II Year / III Semester
// --------------------------------------------------------------------------
export const itYear2CourseDirectory = [
  { acronym: 'SE', code: '23IT31C', title: 'Software Engineering', faculty: 'Mrs.M.Malathi, Asst.Prof; Ms.S.Bagavathi Gayathri, Asst.Prof' },
  { acronym: 'DS', code: '23IT32C', title: 'Data Structures', faculty: 'Dr.V.Manimaran, Asso.Prof; Dr.M.Manimegalai, Asst.Prof(SG)' },
  { acronym: 'COA', code: '23IT33C', title: 'Computer Organisation and Architecture', faculty: 'Mrs.N.Gowthami, Asst.Prof(SG)' },
  { acronym: 'OS', code: '23IT34C', title: 'Operating Systems', faculty: 'Dr.V.Anitha, Asst.Prof(SG)' },
  { acronym: 'PS', code: '23IT35C', title: 'Probability and Statistics', faculty: 'Mr.P.Ganapathy, Asst.Prof/S&H; New Faculty 2/S&H' },
  { acronym: 'COI', code: '23MC01C', title: 'Constitution of India', faculty: 'Mrs.S.Santhi, Asst.Prof(SG)' },
  { acronym: 'CN', code: '23IT38C', title: 'Computer Networks', faculty: 'Dr.S.Chidambaram, Asso.Prof; Dr.J.Beno Ranjana, Asst.Prof' },
  { acronym: 'DS LAB', code: '23IT36C', title: 'Data Structures Laboratory', faculty: 'Dr.V.Manimaran, Dr.M.Manimegalai, Mrs.R.Suguna, Dr.J.Beno Ranjana, Ms.S.Bagavathi Gayathri', venue: 'UG LAB I' },
  { acronym: 'Linux LAB', code: '23IT37C', title: 'Linux System Administration', faculty: 'Dr.V.Anitha, Asst.Prof(SG); Mrs.M.Malathi, Asst.Prof', venue: 'UG LAB III' },
  { acronym: 'CN LAB', code: '23IT38C', title: 'Computer Networks Laboratory', faculty: 'Dr.S.Chidambaram, Asso.Prof; Dr.J.Beno Ranjana, Asst.Prof; Mrs.N.Gowthami', venue: 'UG LAB II' },
  { acronym: 'IPR LAB', code: '23GN03C', title: 'Intellectual Property Rights Study', faculty: 'Dr.V.Anitha, Mrs.S.Santhi, Mrs.S.Kavitha, Ms.S.Bagavathi Gayathri', venue: 'UG LAB I' },
  { acronym: 'SRK', code: '—', title: 'Skillrack', faculty: 'Ms.S.Bagavathi Gayathri, Asst.Prof; Dr.J.Beno Ranjana, Asst.Prof' },
  { acronym: 'NPTEL', code: '—', title: 'NPTEL Hour', faculty: 'Mrs.S.Kavitha, Asst.Prof' },
  { acronym: 'PPH', code: '—', title: 'Placement Preparation Hour', faculty: 'Dr.V.Anitha, Asst.Prof(SG); Mrs.M.Malathi, Asst.Prof' },
  { acronym: 'TUTOR', code: '—', title: 'Tutor Hour', faculty: 'Dr.V.Anitha, Mrs.S.Santhi, Ms.S.Bagavathi Gayathri, Mrs.S.Kavitha' },
];

const it2CourseByAcronym = (acronym) => itYear2CourseDirectory.find((c) => c.acronym === acronym);
function it2Course(acronym) {
  const info = it2CourseByAcronym(acronym);
  return { kind: 'course', acronym, title: info?.title || acronym, code: info?.code || '—', faculty: info?.faculty || '—' };
}
function it2Lab(label, acronym, venue) {
  const info = acronym ? it2CourseByAcronym(acronym) : null;
  return { kind: 'lab', label, acronym: acronym || undefined, code: info?.code || '—', title: info?.title || label, faculty: info?.faculty || '—', venue: venue || info?.venue || 'UG LAB I' };
}

function buildItYear2WeeklyGrid(batch) {
  const isB1 = batch === 'B1';
  return withRoomRotation({
    Monday: [
      { period: itPeriod('I'), ...it2Course('SE') },
      { period: itPeriod('II'), ...it2Course('DS') },
      { period: itPeriod('III'), ...(isB1 ? it2Lab('Linux LAB', 'Linux LAB', 'UG LAB III') : it2Lab('CN LAB', 'CN LAB', 'UG LAB II')) },
      { period: itPeriod('IV'), ...(isB1 ? it2Lab('Linux LAB', 'Linux LAB', 'UG LAB III') : it2Lab('CN LAB', 'CN LAB', 'UG LAB II')) },
      { period: itPeriod('V'), ...it2Course('CN') },
      { period: itPeriod('VI'), ...it2Course('PS') },
      { period: itPeriod('VII'), ...it2Lab('DS LAB', 'DS LAB', 'UG LAB I') },
      { period: itPeriod('VIII'), ...it2Lab('DS LAB', 'DS LAB', 'UG LAB I') },
    ],
    Tuesday: [
      { period: itPeriod('I'), ...it2Course('DS') },
      { period: itPeriod('II'), ...it2Course('COA') },
      { period: itPeriod('III'), ...(isB1 ? it2Lab('CN LAB', 'CN LAB', 'UG LAB II') : it2Lab('Linux LAB', 'Linux LAB', 'UG LAB III')) },
      { period: itPeriod('IV'), ...(isB1 ? it2Lab('CN LAB', 'CN LAB', 'UG LAB II') : it2Lab('Linux LAB', 'Linux LAB', 'UG LAB III')) },
      { period: itPeriod('V'), ...it2Course('PS') },
      { period: itPeriod('VI'), ...it2Course('SRK') },
      { period: itPeriod('VII'), ...it2Course('PPH') },
      { period: itPeriod('VIII'), ...it2Course('PPH') },
    ],
    Wednesday: [
      { period: itPeriod('I'), ...it2Course('CN') },
      { period: itPeriod('II'), ...it2Course('OS') },
      { period: itPeriod('III'), ...it2Course('DS') },
      { period: itPeriod('IV'), ...it2Course('PS') },
      { period: itPeriod('V'), ...it2Lab('IPR LAB', 'IPR LAB', 'UG LAB I') },
      { period: itPeriod('VI'), ...it2Lab('IPR LAB', 'IPR LAB', 'UG LAB I') },
      { period: itPeriod('VII'), ...it2Course('NPTEL') },
      { period: itPeriod('VIII'), ...it2Course('COI') },
    ],
    Thursday: [
      { period: itPeriod('I'), ...it2Course('COA') },
      { period: itPeriod('II'), ...it2Course('OS') },
      { period: itPeriod('III'), ...it2Course('PS') },
      { period: itPeriod('IV'), ...it2Course('TUTOR') },
      { period: itPeriod('V'), ...it2Course('SE') },
      { period: itPeriod('VI'), ...it2Course('SRK') },
      { period: itPeriod('VII'), ...it2Lab('IPR LAB', 'IPR LAB', 'UG LAB I') },
      { period: itPeriod('VIII'), ...it2Lab('IPR LAB', 'IPR LAB', 'UG LAB I') },
    ],
    Friday: [
      { period: itPeriod('I'), ...it2Course('OS') },
      { period: itPeriod('II'), ...it2Course('COA') },
      { period: itPeriod('III'), ...it2Course('SRK') },
      { period: itPeriod('IV'), ...it2Course('CN') },
      { period: itPeriod('V'), ...it2Course('SE') },
      { period: itPeriod('VI'), ...it2Course('COI') },
      { period: itPeriod('VII'), ...it2Lab('DS LAB', 'DS LAB', 'UG LAB I') },
      { period: itPeriod('VIII'), ...it2Lab('DS LAB', 'DS LAB', 'UG LAB I') },
    ],
  });
}

export const itYear2WeeklyTimetableByBatch = {
  B1: buildItYear2WeeklyGrid('B1'),
  B2: buildItYear2WeeklyGrid('B2'),
};

// --------------------------------------------------------------------------
// 3. COMPUTER SCIENCE & ENGINEERING (CSE) — II Year / III Semester
// --------------------------------------------------------------------------
export const cseYear2CourseDirectory = [
  {
    acronym: 'DS',
    code: '23CS31C',
    title: 'Data Structures',
    batches: {
      B1: { faculty: 'Dr.G.Sivakamasundari, Asso.Prof/CSE', venue: 'F7' },
      B2: { faculty: 'Dr.R.Rajakumari, Asso.Prof/CSE', venue: 'F8' },
      B3: { faculty: 'Ms.A.Lincy, AP/CSE', venue: 'F9' },
    },
  },
  {
    acronym: 'CN',
    code: '23CS32C',
    title: 'Computer Networks',
    batches: {
      B1: { faculty: 'Dr.B.Shunmugapriya, Asso.Prof/CSE', venue: 'F7' },
      B2: { faculty: 'Ms.R.Sandhiya, AP/CSE', venue: 'F8' },
      B3: { faculty: 'Ms.G.Anitha, AP/CSE', venue: 'F9' },
    },
  },
  {
    acronym: 'COA',
    code: '23CS33C',
    title: 'Computer Organization and Architecture',
    batches: {
      B1: { faculty: 'Dr.J.Ida Christy, AP(SG)/CSE', venue: 'F7' },
      B2: { faculty: 'Ms.R.Navedha Evanjalin, AP/CSE', venue: 'F8' },
      B3: { faculty: 'Ms.M.Vaijayanthimala, AP/CSE', venue: 'F9' },
    },
  },
  {
    acronym: 'Maths',
    code: '23MA31C',
    title: 'Discrete Mathematics',
    batches: {
      B1: { faculty: 'Dr.S.Anusuya, AP/S&H', venue: 'F7' },
      B2: { faculty: 'Ms.S.Senthil Vadivu, AP/S&H', venue: 'F8' },
      B3: { faculty: 'Ms.R.Vinitha, AP/S&H', venue: 'F9' },
    },
  },
  {
    acronym: 'OS',
    code: '23CS34C',
    title: 'Operating Systems',
    batches: {
      B1: { faculty: 'Mr.K.Rajkumar, AP(SG)/CSE', venue: 'F7' },
      B2: { faculty: 'Dr.K.Mohaideen Pitchai, Prof/CSE', venue: 'F8' },
      B3: { faculty: 'Ms.S.Kayathri, AP/CSE', venue: 'F9' },
    },
  },
  {
    acronym: 'Linux Lab',
    code: '23CS37C',
    title: 'Linux System Administration Lab',
    batches: {
      B1: { faculty: 'Mr.K.Rajkumar, AP(SG)/CSE; Ms.S.G.Janani Ratthna, AP/CSE', venue: 'Linux Lab' },
      B2: { faculty: 'Dr.K.Mohaideen Pitchai, Prof/CSE; Ms.M.N.Rathina Prabha, AP/CSE', venue: 'ICL' },
      B3: { faculty: 'Ms.S.Kayathri, AP/CSE; Ms.A.Lincy, AP/CSE', venue: 'IBM' },
    },
  },
  {
    acronym: 'DS Lab',
    code: '23CS36C',
    title: 'Data Structures Laboratory',
    batches: {
      B1: { faculty: 'Dr.G.Sivakamasundari; Mr.K.Rajkumar', venue: 'CVR' },
      B2: { faculty: 'Dr.R.Rajakumari; Ms.G.Pavithra', venue: 'RM' },
      B3: { faculty: 'Ms.A.Lincy; Dr.J.Ida Christy', venue: 'APJ' },
    },
  },
  {
    acronym: 'CN Lab',
    code: '23CS38C',
    title: 'Computer Networks Laboratory',
    batches: {
      B1: { faculty: 'Dr.B.Shunmugapriya; Ms.M.Vaijayanthimala', venue: 'Cisco Lab' },
      B2: { faculty: 'Ms.R.Sandhiya; Ms.A.Lincy', venue: 'APJ' },
      B3: { faculty: 'Ms.G.Anitha; Ms.T.Rajeswari', venue: 'CVR' },
    },
  },
  {
    acronym: 'IPR Lab',
    code: '23GN03C',
    title: 'Intellectual Property Rights Lab',
    batches: {
      B1: { faculty: 'Dr.S.Dheenathayalan; Ms.R.Navedha Evanjalin', venue: 'F12' },
      B2: { faculty: 'Ms.T.Rajeswari; Dr.B.Shunmugapriya', venue: 'F14' },
      B3: { faculty: 'Ms.M.Vaijayanthimala; Dr.S.Chidambaram', venue: 'F15' },
    },
  },
  {
    acronym: 'PeHV',
    code: '23GN05C',
    title: 'Professional Ethics and Human Values',
    batches: {
      B1: { faculty: 'Ms.A.Lincy, AP/CSE', venue: 'F7' },
      B2: { faculty: 'Ms.T.Rajeswari, AP/CSE', venue: 'F8' },
      B3: { faculty: 'Ms.G.Anitha, AP/CSE', venue: 'F9' },
    },
  },
  {
    acronym: 'GAI/AAI/CDF',
    code: '23CS11V',
    title: 'Generative AI / Applied AI / Cloud Data Foundation',
    batches: {
      B1: { faculty: 'Ms.S.Kayathri; Ms.M.N.Rathina Prabha', venue: 'Cisco Lab' },
      B2: { faculty: 'Ms.A.Lincy; Ms.V.Maheswari', venue: 'IBM' },
      B3: { faculty: 'Mr.J.Karthikeyan; Ms.G.Pavithra', venue: 'APJ' },
    },
  },
  {
    acronym: 'GAI/TNP/ZKP',
    code: '23CS12V',
    title: 'Generative AI / Threat & Network Protection / Zero Knowledge Proofs',
    batches: {
      B1: { faculty: 'Mr.K.Rajkumar; Ms.V.Maheswari', venue: 'Cisco Lab' },
      B2: { faculty: 'Ms.G.Anitha; Ms.M.Vaijayanthimala; Dr.R.Rajakumari', venue: 'APJ' },
      B3: { faculty: 'Ms.R.Navedha Evanjalin', venue: 'CVR' },
    },
  },
  { acronym: 'Skillrack', code: '—', title: 'Skillrack', faculty: 'Dr.K.Mohaideen Pitchai; Ms.S.G.Janani Ratthna' },
  { acronym: 'NPTEL', code: '—', title: 'NPTEL Hour', faculty: 'Ms.R.Navedha Evanjalin; Ms.G.Pavithra' },
  { acronym: 'Tutor', code: '—', title: 'Tutor Hour', faculty: 'Dr.S.Dheenathayalan, Dr.K.Mohaideen Pitchai, Ms.S.Kayathri, Ms.T.Rajeswari, Ms.G.Anitha' },
  { acronym: 'Comm', code: '—', title: 'Communication Skills', faculty: 'Dr.R.Rajakumari, Asso.Prof/CSE; Ms.T.Rajeswari, AP/CSE' },
  { acronym: 'Apt Excellence', code: '—', title: 'Aptitude Excellence', faculty: 'Ms.S.S.Basitha Parveen; Ms.S.Senthil Vadivu' },
  { acronym: 'GIV', code: '—', title: 'Guest Lecture / Industrial Visit', faculty: 'Faculty Team (SVK, SKS)' },
];

const cse2CourseByAcronym = (acronym) => cseYear2CourseDirectory.find((c) => c.acronym === acronym);
function cse2Course(acronym, batch) {
  const info = cse2CourseByAcronym(acronym);
  const bi = info?.batches?.[batch] || info?.batches?.B1;
  return {
    kind: 'course',
    acronym,
    title: info?.title || acronym,
    code: info?.code || '—',
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || '—',
  };
}
function cse2Lab(acronym, label, batch) {
  const info = cse2CourseByAcronym(acronym);
  const bi = info?.batches?.[batch] || info?.batches?.B1;
  return {
    kind: 'lab',
    acronym,
    label: label || `${info?.title || acronym}`,
    code: info?.code || '—',
    title: info?.title || label,
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || '—',
  };
}

function buildCseYear2WeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...cse2Course('DS', batch) },
      { period: period('II'), ...cse2Course('CN', batch) },
      { period: period('III'), ...cse2Course('COA', batch) },
      { period: period('IV'), ...cse2Course('Maths', batch) },
      { period: period('V'), ...cse2Lab('Linux Lab', 'Linux Lab', batch) },
      { period: period('VI'), ...cse2Lab('Linux Lab', 'Linux Lab', batch) },
      { period: period('VII'), ...cse2Lab('GAI/AAI/CDF', 'GAI/AAI/CDF', batch) },
      { period: period('VIII'), ...cse2Lab('GAI/AAI/CDF', 'GAI/AAI/CDF', batch) },
    ],
    Tuesday: [
      { period: period('I'), ...cse2Course('CN', batch) },
      { period: period('II'), ...cse2Course('Skillrack', batch) },
      { period: period('III'), ...cse2Course('DS', batch) },
      { period: period('IV'), ...cse2Course('OS', batch) },
      { period: period('V'), ...cse2Lab('DS Lab', 'DS Lab', batch) },
      { period: period('VI'), ...cse2Lab('DS Lab', 'DS Lab', batch) },
      { period: period('VII'), ...cse2Lab('IPR Lab', 'IPR Lab', batch) },
      { period: period('VIII'), ...cse2Lab('IPR Lab', 'IPR Lab', batch) },
    ],
    Wednesday: [
      { period: period('I'), ...cse2Course('OS', batch) },
      { period: period('II'), ...cse2Course('COA', batch) },
      { period: period('III'), ...cse2Course('Maths', batch) },
      { period: period('IV'), ...cse2Course('NPTEL', batch) },
      { period: period('V'), ...cse2Lab('DS Lab', 'DS Lab', batch) },
      { period: period('VI'), ...cse2Lab('DS Lab', 'DS Lab', batch) },
      { period: period('VII'), ...cse2Course('Maths', batch) },
      { period: period('VIII'), ...cse2Course('Tutor', batch) },
    ],
    Thursday: [
      { period: period('I'), ...cse2Course('Maths', batch) },
      { period: period('II'), ...cse2Course('Comm', batch) },
      { period: period('III'), ...cse2Course('OS', batch) },
      { period: period('IV'), ...cse2Course('CN', batch) },
      { period: period('V'), ...cse2Course('Apt Excellence', batch) },
      { period: period('VI'), ...cse2Course('Apt Excellence', batch) },
      { period: period('VII'), ...cse2Lab('IPR Lab', 'IPR Lab', batch) },
      { period: period('VIII'), ...cse2Lab('IPR Lab', 'IPR Lab', batch) },
    ],
    Friday: [
      { period: period('I'), ...cse2Course('COA', batch) },
      { period: period('II'), ...cse2Course('DS', batch) },
      { period: period('III'), ...cse2Course('PeHV', batch) },
      { period: period('IV'), ...cse2Course('PeHV', batch) },
      { period: period('V'), ...cse2Lab('CN Lab', 'CN Lab', batch) },
      { period: period('VI'), ...cse2Lab('CN Lab', 'CN Lab', batch) },
      { period: period('VII'), ...cse2Lab('GAI/TNP/ZKP', 'GAI/TNP/ZKP', batch) },
      { period: period('VIII'), ...cse2Lab('GAI/TNP/ZKP', 'GAI/TNP/ZKP', batch) },
    ],
    Saturday: [
      { period: period('III'), ...cse2Course('GIV', batch) },
      { period: period('IV'), ...cse2Course('GIV', batch) },
    ],
  };
}

export const cseYear2WeeklyTimetableByBatch = {
  B1: buildCseYear2WeeklyGrid('B1'),
  B2: buildCseYear2WeeklyGrid('B2'),
  B3: buildCseYear2WeeklyGrid('B3'),
};

// --------------------------------------------------------------------------
// 4. MECHANICAL ENGINEERING (MECH) — II Year / III Semester
// --------------------------------------------------------------------------
export const mechYear2CourseDirectory = [
  { acronym: 'EVS', code: '23MC02C', title: 'Environmental Science and Engineering', faculty: 'Dr.B.Poovammal, AP/S&H (BPA)' },
  { acronym: 'AE', code: '23EE31C', title: 'Automotive Engineering / Applied Electronics', faculty: 'Mr.P.Ganapathy, AP/S&H (PG)' },
  {
    acronym: 'FM',
    code: '23ME33C',
    title: 'Fluid Mechanics and Machinery',
    batches: {
      B1: { faculty: 'Dr.D.Veera Kumaran, Asso.Prof/Mech', venue: 'Hall 4' },
      B2: { faculty: 'Mr.P.Ramanathan, AP/Mech', venue: 'Hall 5' },
    },
  },
  {
    acronym: 'ETD',
    code: '23ME32C',
    title: 'Engineering Thermodynamics',
    batches: {
      B1: { faculty: 'Dr.S.Iyahraja, Prof/Mech (SIR)', venue: 'Hall 4' },
      B2: { faculty: 'Dr.M.C.Eniyan, Asso.Prof/Mech (MCE)', venue: 'Hall 5' },
    },
  },
  {
    acronym: 'SNM',
    code: '23ME31C',
    title: 'Transforms and Numerical Methods',
    batches: {
      B1: { faculty: 'Dr.S.Gopalakannan, AP(SG)/Maths', venue: 'Hall 4' },
      B2: { faculty: 'Dr.R.Vijayan, AP/Maths', venue: 'Hall 5' },
    },
  },
  { acronym: 'ME', code: '23ME34C', title: 'Manufacturing Engineering', faculty: 'Mr.R.Harikrishnan, AP/Mech (RH)' },
  { acronym: 'BMP', code: '23ME36C', title: 'Basic Manufacturing Processes', faculty: 'Dr.M.Kathiresan, Asso.Prof/Mech (MK)' },
  {
    acronym: 'KOM',
    code: '23ME35C',
    title: 'Kinematics of Machinery',
    batches: {
      B1: { faculty: 'Dr.A.Andrews, Asso.Prof/Mech (AA)', venue: 'Hall 4' },
      B2: { faculty: 'Mr.K.Thoufiq Mohammed, AP/Mech (KTM)', venue: 'Hall 5' },
    },
  },
  {
    acronym: 'IPR',
    code: '23GN03C',
    title: 'Intellectual Property Rights',
    batches: {
      B1: { faculty: 'Dr.I.Sankar, Asso.Prof/Mech (IS)', venue: 'Hall 4' },
      B2: { faculty: 'Mr.M.Ramasubbu, AP/Mech (MR)', venue: 'Hall 5' },
    },
  },
  {
    acronym: 'BMP-FM-Lab',
    code: '23ME37C',
    title: 'Fluid Mechanics & Machinery / Basic Manufacturing Processes Lab',
    batches: {
      B1: { label: 'BMP Lab', faculty: 'Dr.M.Kathiresan (MK)', venue: 'BMP Workshop' },
      B2: { label: 'FM Lab', faculty: 'Dr.D.Veera Kumaran (DVK); Mr.P.Ramanathan (PR)', venue: 'Fluid Mechanics Lab' },
    },
  },
  {
    acronym: 'KOM-ME-Lab',
    code: '23ME38C',
    title: 'Kinematics and Dynamics / Manufacturing Engineering Lab',
    batches: {
      B1: { label: 'KOM Lab', faculty: 'Dr.A.Andrews (AA); Mr.K.Thoufiq Mohammed (KTM)', venue: 'Dynamics Lab' },
      B2: { label: 'ME Lab', faculty: 'Mr.R.Harikrishnan (RH); Dr.M.T.Ravikumar (MTR)', venue: 'Machine Shop' },
    },
  },
  { acronym: 'Tutor', code: '—', title: 'Tutor Hour', faculty: 'Dr.M.T.Ravikumar, Dr.C.Veera Ajay, Mr.M.Ramasubbu' },
];

const mech2CourseByAcronym = (acronym) => mechYear2CourseDirectory.find((c) => c.acronym === acronym);
function mech2Course(acronym, batch) {
  const info = mech2CourseByAcronym(acronym);
  const bi = info?.batches?.[batch] || info?.batches?.B1;
  return {
    kind: 'course',
    acronym,
    title: info?.title || acronym,
    code: info?.code || '—',
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || (batch === 'B2' ? 'Hall 5' : 'Hall 4'),
  };
}
function mech2Lab(acronym, batch, alt = false) {
  const info = mech2CourseByAcronym(acronym);
  const bKey = alt ? (batch === 'B1' ? 'B2' : 'B1') : batch;
  const bi = info?.batches?.[bKey] || info?.batches?.B1;
  return {
    kind: 'lab',
    acronym,
    label: bi?.label || info?.title || acronym,
    code: info?.code || '—',
    title: info?.title || acronym,
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || 'Workshop / Lab',
  };
}

function buildMechYear2WeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...mech2Course('EVS', batch) },
      { period: period('II'), ...mech2Course('AE', batch) },
      { period: period('III'), ...mech2Course('FM', batch) },
      { period: period('IV'), ...mech2Course('ETD', batch) },
      { period: period('V'), ...mech2Course('SNM', batch) },
      { period: period('VI'), ...mech2Lab('BMP-FM-Lab', batch) },
      { period: period('VII'), ...mech2Lab('BMP-FM-Lab', batch) },
      { period: period('VIII'), ...mech2Course('Tutor', batch) },
    ],
    Tuesday: [
      { period: period('I'), ...mech2Course('SNM', batch) },
      { period: period('II'), ...mech2Course('ME', batch) },
      { period: period('III'), ...mech2Course('AE', batch) },
      { period: period('IV'), ...mech2Course('EVS', batch) },
      { period: period('V'), ...mech2Course('IPR', batch) },
      { period: period('VI'), ...mech2Course('IPR', batch) },
      { period: period('VII'), ...mech2Course('ETD', batch) },
    ],
    Wednesday: [
      { period: period('I'), ...mech2Course('ETD', batch) },
      { period: period('II'), ...mech2Course('SNM', batch) },
      { period: period('III'), ...mech2Course('BMP', batch) },
      { period: period('IV'), ...mech2Course('ME', batch) },
      { period: period('V'), ...mech2Lab('KOM-ME-Lab', batch) },
      { period: period('VI'), ...mech2Lab('KOM-ME-Lab', batch) },
      { period: period('VII'), ...mech2Course('KOM', batch) },
    ],
    Thursday: [
      { period: period('I'), ...mech2Course('BMP', batch) },
      { period: period('II'), ...mech2Course('KOM', batch) },
      { period: period('III'), ...mech2Lab('BMP-FM-Lab', batch, true) },
      { period: period('IV'), ...mech2Lab('BMP-FM-Lab', batch, true) },
      { period: period('V'), ...mech2Course('IPR', batch) },
      { period: period('VI'), ...mech2Course('IPR', batch) },
      { period: period('VII'), ...mech2Course('FM', batch) },
    ],
    Friday: [
      { period: period('I'), ...mech2Course('FM', batch) },
      { period: period('II'), ...mech2Course('KOM', batch) },
      { period: period('III'), ...mech2Course('SNM', batch) },
      { period: period('IV'), ...mech2Course('ETD', batch) },
      { period: period('V'), ...mech2Lab('KOM-ME-Lab', batch, true) },
      { period: period('VI'), ...mech2Lab('KOM-ME-Lab', batch, true) },
      { period: period('VII'), ...mech2Course('BMP', batch) },
    ],
  };
}

export const mechYear2WeeklyTimetableByBatch = {
  B1: buildMechYear2WeeklyGrid('B1'),
  B2: buildMechYear2WeeklyGrid('B2'),
};

// --------------------------------------------------------------------------
// 5. ELECTRONICS & COMMUNICATION ENGINEERING (ECE) — II Year / III Semester
// --------------------------------------------------------------------------
export const eceYear2CourseDirectory = [
  {
    acronym: 'SS',
    code: '23EC33C',
    title: 'Signals and Systems',
    batches: {
      B1: { faculty: 'Dr.R.Manjula Devi, AP(SG)/ECE (RMD)', venue: 'H12' },
      B2: { faculty: 'Dr.T.S.Arun Samuel, Professor/ECE (SSA)', venue: 'H13' },
      B3: { faculty: 'Mrs.G.Akalya Devi, AP/ECE (GAD)', venue: 'H14' },
    },
  },
  {
    acronym: 'ED',
    code: '23EC31C',
    title: 'Electron Devices',
    batches: {
      B1: { faculty: 'Dr.K.J.Prasanna Venkatesan, AP(SG)/ECE (KJP)', venue: 'H12' },
      B2: { faculty: 'Mrs.C.Kalieswari, AP/ECE (CK)', venue: 'H13' },
      B3: { faculty: 'Dr.M.Sathishkumar, AP(SG)/ECE (MSK)', venue: 'H14' },
    },
  },
  {
    acronym: 'CN',
    code: '23EC34C',
    title: 'Circuit Networks',
    batches: {
      B1: { faculty: 'Dr.S.Chidambaram, Asso.Prof/IT (SC)', venue: 'H12' },
      B2: { faculty: 'Mrs.S.Karthika, AP/ECE (KS)', venue: 'H13' },
      B3: { faculty: 'Ms.B.Siraj Dowbika, AP/ECE (BSD)', venue: 'H14' },
    },
  },
  {
    acronym: 'DE',
    code: '23EC32C',
    title: 'Digital Electronics',
    batches: {
      B1: { faculty: 'Dr.A.Shenbagarajan, AP/ECE (ASY)', venue: 'H12' },
      B2: { faculty: 'Dr.S.M.Leela Bharathi, AP/ECE (SMBL)', venue: 'H13' },
      B3: { faculty: 'Dr.N.Nithyanandhan, AP/ECE (NP)', venue: 'H14' },
    },
  },
  {
    acronym: 'PRP',
    code: '23MA31C',
    title: 'Probability and Random Processes',
    batches: {
      B1: { faculty: 'Dr.M.Anitha, AP/S&H (MA)', venue: 'H12' },
      B2: { faculty: 'Dr.N.Shanmugapriya, AP/S&H (NS)', venue: 'H13' },
      B3: { faculty: 'Ms.G.Suganya, AP/S&H (GS)', venue: 'H14' },
    },
  },
  {
    acronym: 'ED Lab',
    code: '23EC36C',
    title: 'Electron Devices Laboratory',
    faculty: 'Dr.K.J.Prasanna Venkatesan (KJP); Mrs.C.Kalieswari (CK); Dr.M.Sathishkumar (MSK)',
    venue: 'IC Lab',
  },
  {
    acronym: 'DE Lab',
    code: '23EC37C',
    title: 'Digital Electronics Laboratory',
    faculty: 'Dr.S.M.Leela Bharathi (SMM); Dr.T.S.Arun Samuel (ASA); Dr.N.Nithyanandhan (NP)',
    venue: 'IC Lab',
  },
  {
    acronym: 'CN Lab',
    code: '23EC38C',
    title: 'Circuit Networks Laboratory',
    faculty: 'Mrs.S.Karthika (KS); Dr.R.Manjula Devi (RMD); Dr.S.Chidambaram (SC)',
    venue: 'DSP Lab',
  },
  {
    acronym: 'IPR',
    code: '23GN03C',
    title: 'Intellectual Property Rights Study',
    batches: {
      B1: { faculty: 'Dr.T.S.Arun Samuel (SSA); Mrs.G.Akalya Devi (GAD); Dr.M.Sathishkumar (MSK)', venue: 'IC Lab' },
      B2: { faculty: 'Dr.R.Manjula Devi (RMD); Dr.S.M.Leela Bharathi (SMM); Dr.N.Nithyanandhan (NP)', venue: 'IC Lab' },
      B3: { faculty: 'Mr.P.Parthasarathi (PP); Mrs.S.Pricilla Mary (SPM); Ms.B.Siraj Dowbika (BSD)', venue: 'DSP Lab' },
    },
  },
  { acronym: 'GATE', code: '—', title: 'GATE Training', faculty: 'Dr.T.S.Arun Samuel (SSA), Mrs.G.Akalya Devi (GAD), Ms.S.Bagavathi (SB)' },
  { acronym: 'TUTOR', code: '—', title: 'Tutor Hour', faculty: 'Dr.S.Chidambaram, Dr.R.Manjula Devi, Mrs.C.Kalieswari, Mrs.C.K.Balasundari, Mrs.V.SriRengaNatchiyar, Mr.P.Parthasarathi' },
  { acronym: 'LIBRARY', code: '—', title: 'Library Hour', faculty: 'Mrs.C.K.Balasundari, Mrs.V.SriRengaNatchiyar, Mrs.S.Karthika' },
  { acronym: 'NPTEL', code: '—', title: 'NPTEL Hour', faculty: 'Dr.S.Chidambaram, Dr.R.Manjula Devi, Mrs.V.SriRengaNatchiyar' },
];

const ece2CourseByAcronym = (acronym) => eceYear2CourseDirectory.find((c) => c.acronym === acronym);
function ece2Course(acronym, batch) {
  const info = ece2CourseByAcronym(acronym);
  const bi = info?.batches?.[batch] || info?.batches?.B1;
  const roomFallback = batch === 'B3' ? 'H14' : batch === 'B2' ? 'H13' : 'H12';
  return {
    kind: 'course',
    acronym,
    title: info?.title || acronym,
    code: info?.code || '—',
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || roomFallback,
  };
}
function ece2Lab(acronym, batch) {
  const info = ece2CourseByAcronym(acronym);
  const bi = info?.batches?.[batch] || info?.batches?.B1;
  return {
    kind: 'lab',
    acronym,
    label: `${info?.title || acronym}`,
    title: info?.title || acronym,
    code: info?.code || '—',
    faculty: bi?.faculty || info?.faculty || '—',
    venue: bi?.venue || info?.venue || 'IC Lab',
  };
}

// Lab rotation map:
// Tuesday VII-VIII: [III / II / I] -> B1: CN Lab, B2: DE Lab, B3: ED Lab
// Wednesday III-IV: [II / I / III] -> B1: DE Lab, B2: ED Lab, B3: CN Lab
// Friday VII-VIII:  [I / III / II] -> B1: ED Lab, B2: CN Lab, B3: DE Lab
const ECE2_ROTATION_TUE = { B1: 'CN Lab', B2: 'DE Lab', B3: 'ED Lab' };
const ECE2_ROTATION_WED = { B1: 'DE Lab', B2: 'ED Lab', B3: 'CN Lab' };
const ECE2_ROTATION_FRI = { B1: 'ED Lab', B2: 'CN Lab', B3: 'DE Lab' };

function buildEceYear2WeeklyGrid(batch) {
  return {
    Monday: [
      { period: period('I'), ...ece2Course('SS', batch) },
      { period: period('II'), ...ece2Course('ED', batch) },
      { period: period('III'), ...ece2Course('DE', batch) },
      { period: period('IV'), ...ece2Course('CN', batch) },
      { period: period('V'), ...ece2Course('PRP', batch) },
      { period: period('VII'), ...ece2Lab('IPR', batch) },
      { period: period('VIII'), ...ece2Lab('IPR', batch) },
    ],
    Tuesday: [
      { period: period('I'), ...ece2Course('ED', batch) },
      { period: period('II'), ...ece2Course('CN', batch) },
      { period: period('III'), ...ece2Course('DE', batch) },
      { period: period('IV'), ...ece2Course('SS', batch) },
      { period: period('V'), ...ece2Course('PRP', batch) },
      { period: period('VI'), ...ece2Course('TUTOR', batch) },
      { period: period('VII'), ...ece2Lab(ECE2_ROTATION_TUE[batch], batch) },
      { period: period('VIII'), ...ece2Lab(ECE2_ROTATION_TUE[batch], batch) },
    ],
    Wednesday: [
      { period: period('I'), ...ece2Course('CN', batch) },
      { period: period('II'), ...ece2Course('SS', batch) },
      { period: period('III'), ...ece2Lab(ECE2_ROTATION_WED[batch], batch) },
      { period: period('IV'), ...ece2Lab(ECE2_ROTATION_WED[batch], batch) },
      { period: period('V'), ...ece2Course('PRP', batch) },
      { period: period('VI'), ...ece2Course('LIBRARY', batch) },
    ],
    Thursday: [
      { period: period('I'), ...ece2Course('PRP', batch) },
      { period: period('II'), ...ece2Course('DE', batch) },
      { period: period('III'), ...ece2Lab('IPR', batch) },
      { period: period('IV'), ...ece2Lab('IPR', batch) },
      { period: period('VII'), ...ece2Course('NPTEL', batch) },
      { period: period('VIII'), ...ece2Course('NPTEL', batch) },
    ],
    Friday: [
      { period: period('I'), ...ece2Course('GATE', batch) },
      { period: period('II'), ...ece2Course('DE', batch) },
      { period: period('III'), ...ece2Course('PRP', batch) },
      { period: period('IV'), ...ece2Course('ED', batch) },
      { period: period('V'), ...ece2Course('SS', batch) },
      { period: period('VI'), ...ece2Course('SS', batch) },
      { period: period('VII'), ...ece2Lab(ECE2_ROTATION_FRI[batch], batch) },
      { period: period('VIII'), ...ece2Lab(ECE2_ROTATION_FRI[batch], batch) },
    ],
  };
}

export const eceYear2WeeklyTimetableByBatch = {
  B1: buildEceYear2WeeklyGrid('B1'),
  B2: buildEceYear2WeeklyGrid('B2'),
  B3: buildEceYear2WeeklyGrid('B3'),
};

// ------------------------------------------------------------------------
// DEPARTMENT + YEAR AWARE TIMETABLE REGISTRY
// ------------------------------------------------------------------------
// The reusable shape the whole app reads from:
//   department -> year -> batch -> weekly grid
export const departmentTimetables = {
  CSE: {
    'I Year': {},
    'II Year': cseYear2WeeklyTimetableByBatch,
    'III Year': weeklyTimetableByBatch,
    'IV Year': {},
  },
  IT: {
    'I Year': {},
    'II Year': itYear2WeeklyTimetableByBatch,
    'III Year': itWeeklyTimetableByBatch,
    'IV Year': {},
  },
  AIDS: {
    'I Year': {},
    'II Year': aidsYear2WeeklyTimetableByBatch,
    'III Year': aidsWeeklyTimetableByBatch,
    'IV Year': {},
  },
  MECH: {
    'I Year': {},
    'II Year': mechYear2WeeklyTimetableByBatch,
    'III Year': mechWeeklyTimetableByBatch,
    'IV Year': {},
  },
  CIVIL: {
    'I Year': {},
    'II Year': {},
    'III Year': civilWeeklyTimetableByBatch,
    'IV Year': {},
  },
  EEE: { 'I Year': {}, 'II Year': {}, 'III Year': {}, 'IV Year': {} },
  ECE: {
    'I Year': {},
    'II Year': eceYear2WeeklyTimetableByBatch,
    'III Year': eceWeeklyTimetableByBatch,
    'IV Year': {},
  },
  'S&H': { 'I Year': {}, 'II Year': {}, 'III Year': {}, 'IV Year': {} },
};

// Helper to normalize department identifiers (e.g. AI&DS -> AIDS)
export function normalizeDepartment(dept) {
  if (!dept) return '';
  const s = String(dept).trim();
  return (s === 'AI&DS' || s.toUpperCase() === 'AI&DS') ? 'AIDS' : s;
}

// Department+year combinations that currently have at least one uploaded batch.
export const AVAILABLE_TIMETABLES = Object.entries(departmentTimetables).flatMap(([dept, years]) =>
  Object.entries(years)
    .filter(([, batches]) => Object.keys(batches).length > 0)
    .map(([year]) => ({ department: dept, year }))
);

// Each uploaded timetable uses its own department's real semester label (CSE's
// is "Odd Semester", MECH's is "V Semester") — never a single generic label
// stamped across every department.
const SEMESTER_LABELS = {
  CSE: SEMESTER,
  MECH: MECH_SEMESTER,
  CIVIL: SEMESTER,
  IT: SEMESTER,
  AIDS: AIDS_SEMESTER,
  ECE: SEMESTER,
};
export function getSemesterLabel(department) {
  return SEMESTER_LABELS[normalizeDepartment(department)] || SEMESTER;
}

/** Which batches actually exist for a given department + year — B1/B2/B3 for
 * CSE III Year, B1/B2 for MECH III Year, [] for anything not uploaded yet.
 * Every batch switcher in the app reads this instead of a hardcoded list, so
 * it's correct regardless of how many batches a given department runs. */
export function getAvailableBatches(department, year) {
  const forYear = departmentTimetables[normalizeDepartment(department)]?.[year];
  return forYear ? Object.keys(forYear) : [];
}

// Most departments share one bell schedule (PERIODS, defined above) — IT
// runs its own, slightly offset one (IT_PERIODS). Any view that renders
// period start/end times by department (like the Week-view table header)
// should look them up here rather than assuming PERIODS applies everywhere.
const DEPARTMENT_PERIODS = { IT: IT_PERIODS };
export function getPeriodsForDepartment(department) {
  return DEPARTMENT_PERIODS[normalizeDepartment(department)] || PERIODS;
}

/**
 * The single source of truth for "what does this department + year + batch see".
 * Returns null whenever there is no uploaded data for that exact combination —
 * callers should render the Timetable Not Available empty state in that case,
 * never a different department's, year's or batch's data.
 */
export function getDepartmentTimetable(department, year, batch) {
  const forDept = departmentTimetables[normalizeDepartment(department)];
  const forYear = forDept?.[year];
  if (!forYear) return null;
  return forYear[batch] || null;
}

// Legacy 2-arg helper kept for call sites that don't yet carry a year —
// assumes III Year (the only year with real data today).
export function getDepartmentTimetableLegacy(department, batch) {
  return getDepartmentTimetable(department, YEAR, batch);
}
