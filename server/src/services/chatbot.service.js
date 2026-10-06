import Classroom from '../models/Classroom.js';
import TimetableSlot from '../models/TimetableSlot.js';
import Booking from '../models/Booking.js';
import VenueChangeNotice from '../models/VenueChangeNotice.js';
import RecentlyViewed from '../models/RecentlyViewed.js';

const DEMO_TODAY = 'Monday';
const DEMO_DATE = '2026-08-17';
const DEMO_TOMORROW_DATE = '2026-08-18';

/** Normalizes text for intent classification */
export function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[?!.,;:'"()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Intent classification */
export function classifyIntent(rawMessage, history = []) {
  const norm = normalizeText(rawMessage);

  // 1. General Greetings
  if (
    norm === 'hi' ||
    norm.startsWith('hi ') ||
    norm === 'hello' ||
    norm.startsWith('hello ') ||
    norm === 'hey' ||
    norm.startsWith('hey ') ||
    norm.includes('good morning') ||
    norm.includes('good afternoon') ||
    norm.includes('good evening') ||
    norm === 'greetings'
  ) {
    return 'GREETING';
  }

  // 2. Identity
  if (
    norm.includes('who are you') ||
    norm.includes('what is your name') ||
    norm.includes("what's your name") ||
    norm.includes('who made you')
  ) {
    return 'IDENTITY';
  }

  // 3. General Help & Capabilities
  if (
    norm.includes('what can you do') ||
    norm.includes('how can you help') ||
    norm.includes('what are your features') ||
    norm === 'help' ||
    norm === 'help me'
  ) {
    return 'GENERAL_HELP';
  }

  // 4. Small Talk
  if (
    norm.includes('how are you') ||
    norm.includes('how are you doing') ||
    norm.includes("how's it going") ||
    norm.includes('how do you do')
  ) {
    return 'SMALL_TALK';
  }

  // 5. Gratitude / Thanks
  if (
    norm.includes('thank you') ||
    norm === 'thanks' ||
    norm.startsWith('thanks ') ||
    norm.includes('thank u') ||
    norm === 'thx'
  ) {
    return 'THANKS';
  }

  // 6. Goodbyes
  if (
    norm === 'bye' ||
    norm.startsWith('bye ') ||
    norm.includes('goodbye') ||
    norm.includes('see you') ||
    norm.includes('take care')
  ) {
    return 'GOODBYE';
  }

  // 7. Campus Intent: Upcoming Classes
  if (
    norm.includes('upcoming class') ||
    norm.includes('upcoming classes') ||
    norm.includes('classes upcoming') ||
    norm.includes('classes coming up') ||
    norm.includes('next classes') ||
    norm.includes('what classes are next') ||
    norm.includes('classes next')
  ) {
    return 'UPCOMING_CLASSES';
  }

  // 8. Campus Intent: Next Class
  if (
    norm.includes('next class') ||
    norm.includes('where is my next') ||
    norm.includes('what is my next') ||
    norm.includes('what room is my next class') ||
    norm.includes('where do i go next')
  ) {
    return 'NEXT_CLASS';
  }

  // 9. Campus Intent: Smart Classroom Allocation Request (e.g. "I need a smart classroom tomorrow at 2 PM for 60 students")
  if (
    (norm.includes('i need a') || norm.includes('book a') || norm.includes('find me a') || norm.includes('allocate')) &&
    (norm.includes('students') || norm.includes('seats') || norm.includes('capacity')) &&
    (norm.includes('pm') || norm.includes('am') || norm.includes(':') || norm.includes('tomorrow') || norm.includes('today'))
  ) {
    return 'SMART_ALLOCATION_RECOMMEND';
  }

  // 10. Campus Intent: How to Book / Booking Guidance
  if (
    norm.includes('how do i book') ||
    norm.includes('how to book') ||
    norm.includes('how can i book') ||
    norm.includes('booking process') ||
    norm === 'how to book' ||
    norm === 'book a room'
  ) {
    return 'BOOKING_GUIDE';
  }

  // 11. Campus Intent: Smart Classrooms Inquiry
  if (
    norm.includes('smart classroom') ||
    norm.includes('smart room') ||
    (norm.includes('smart') && (norm.includes('available') || norm.includes('which') || norm.includes('show')))
  ) {
    return 'SMART_CLASSROOM';
  }

  // 12. Campus Intent: Venue Changes
  if (
    norm.includes('venue change') ||
    norm.includes('classroom change') ||
    norm.includes('room change') ||
    norm.includes('did my classroom change') ||
    norm.includes('was my class moved') ||
    norm.includes('was f12 changed') ||
    norm.includes('any venue changes')
  ) {
    return 'VENUE_CHANGE';
  }

  // 13. Campus Intent: Course Venue Lookup (e.g., "Where is OOAD?", "What is the venue for DevOps?")
  if (
    norm.includes('where is ooad') ||
    norm.includes('venue for ooad') ||
    norm.includes('where is devops') ||
    norm.includes('venue for devops') ||
    norm.includes('venue for') ||
    (norm.startsWith('where is') && !norm.includes('next class'))
  ) {
    return 'COURSE_LOOKUP';
  }

  // 14. Campus Intent: Timetable (Today, Tomorrow, Upcoming Day, or specific day)
  if (
    norm.includes('timetable') ||
    norm.includes('what classes do i have') ||
    norm.includes('my schedule') ||
    norm.includes('schedule') ||
    norm.includes('class after lunch') ||
    norm.includes('classes today') ||
    norm.includes("today's classes") ||
    norm.includes('classes tomorrow') ||
    norm.includes("tomorrow's classes") ||
    norm.includes('classes for') ||
    norm.includes('schedule for')
  ) {
    return 'TIMETABLE';
  }

  // 14. Contextual memory: "What about F14?" or "How about F14?"
  if (
    /^(what|how)\s+about\s+[fgs]\d+/i.test(rawMessage.trim()) ||
    /^is\s+[fgs]\d+(\s+free|\s+available)?\??$/i.test(rawMessage.trim())
  ) {
    return 'CLASSROOM_AVAILABILITY';
  }

  // 15. Campus Intent: Classroom Availability & Status
  if (
    norm.includes('available at') ||
    norm.includes('free at') ||
    norm.includes('which classrooms are free') ||
    norm.includes('which classrooms are available') ||
    norm.includes('who booked') ||
    norm.includes('cse classrooms') ||
    norm.includes('is f12 available') ||
    norm.includes('is f14 available') ||
    norm.includes('is f9 available') ||
    (/\b([fgs]\d+|hall\s*\d+|icl|cvr|cadm)\b/i.test(rawMessage) && (norm.includes('is') || norm.includes('available') || norm.includes('status') || norm.includes('booked')))
  ) {
    return 'CLASSROOM_AVAILABILITY';
  }

  // 16. Recent Bookings or Recently Accessed
  if (norm.includes('recent bookings') || norm.includes('my bookings')) {
    return 'RECENT_BOOKINGS';
  }
  if (norm.includes('recently viewed') || norm.includes('recently accessed')) {
    return 'RECENTLY_ACCESSED';
  }

  // 17. Out-of-scope non-campus questions
  const campusKeywords = [
    'class',
    'classes',
    'classroom',
    'classrooms',
    'room',
    'rooms',
    'timetable',
    'schedule',
    'faculty',
    'slot',
    'slots',
    'venue',
    'venues',
    'campus',
    'course',
    'courses',
    'lab',
    'labs',
    'ooad',
    'devops',
    'smart',
    'board',
    'f12',
    'f14',
    'f9',
    's5',
    'cse',
    'mech',
    'ece',
    'civil',
    'upcoming',
    'tomorrow',
    'today',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ];
  const hasCampusKeyword = campusKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(norm));

  if (!hasCampusKeyword) {
    return 'OUT_OF_SCOPE';
  }

  return 'CAMPUS_UNKNOWN';
}

/** Handles General Conversational queries without hitting database */
export function handleGeneralConversation(intent, rawMessage, user) {
  const norm = normalizeText(rawMessage);
  // Always use full name so faculty titles and initials (e.g. "Dr. Arjun Kumar", "M C Eniyan") are never chopped to a single letter
  const displayName = user?.name?.trim() || '';

  switch (intent) {
    case 'GREETING': {
      if (norm === 'hi' || norm.startsWith('hi ')) {
        return displayName
          ? `Hi ${displayName}! I'm Campus Assistant. How can I help you today?`
          : "Hi! I'm Campus Assistant. How can I help you today?";
      }
      if (norm === 'hello' || norm.startsWith('hello ')) {
        return displayName
          ? `Hello ${displayName}! I can help you with timetables, classrooms, bookings, venue changes, and more. What would you like to know?`
          : "Hello! I can help you with timetables, classrooms, bookings, venue changes, and more. What would you like to know?";
      }
      if (norm === 'hey' || norm.startsWith('hey ')) {
        return displayName
          ? `Hey ${displayName}! How can I help you with Sam Campus Slot?`
          : "Hey! How can I help you with Sam Campus Slot?";
      }
      if (norm.includes('good morning')) {
        return displayName
          ? `Good morning ${displayName}! How can I help you today?`
          : "Good morning! How can I help you today?";
      }
      if (norm.includes('good afternoon')) {
        return displayName
          ? `Good afternoon ${displayName}! What can I help you with?`
          : "Good afternoon! What can I help you with?";
      }
      if (norm.includes('good evening')) {
        return displayName
          ? `Good evening ${displayName}! How can I help you?`
          : "Good evening! How can I help you?";
      }
      return displayName
        ? `Hello ${displayName}! I'm Campus Assistant. How can I help you today?`
        : "Hello! I'm Campus Assistant. How can I help you today?";
    }

    case 'IDENTITY': {
      return "I'm Campus Assistant, the virtual assistant for Sam Campus Slot. I can help you with timetables, classroom availability, bookings, venue changes, and campus information.";
    }

    case 'GENERAL_HELP': {
      return "I can help you check timetables, find your next class, check classroom availability, find smart classrooms, view venue changes, and guide you through classroom booking.";
    }

    case 'SMALL_TALK': {
      return "I'm doing well, thank you! Ready to help you with your classes, classrooms, and bookings. How can I help you?";
    }

    case 'THANKS': {
      if (norm.includes('thank you')) {
        return "You're welcome! Let me know if you need anything else.";
      }
      return "You're welcome! I'm here whenever you need help.";
    }

    case 'GOODBYE': {
      if (norm === 'bye' || norm.startsWith('bye ')) {
        return "Goodbye! Have a great day.";
      }
      return "Goodbye! Feel free to come back whenever you need help.";
    }

    case 'OUT_OF_SCOPE': {
      return "I'm mainly designed to help with Sam Campus Slot. I can help with timetables, classrooms, bookings, venue changes, and campus-related questions.";
    }

    default:
      return null;
  }
}

/** Extracts time window from message or defaults to 14:00-15:00 */
function extractTimeWindow(message, history = []) {
  const combined = `${history.slice(-2).map((m) => m.content).join(' ')} ${message}`.toLowerCase();
  
  if (combined.includes('2 pm') || combined.includes('2:00') || combined.includes('14:00')) {
    return { start: '14:00', end: '15:00', display: '2:00 PM' };
  }
  if (combined.includes('11:10') || combined.includes('11 am') || combined.includes('11:00')) {
    return { start: '11:10', end: '12:00', display: '11:10 AM' };
  }
  if (combined.includes('10:05') || combined.includes('10 am') || combined.includes('10:00')) {
    return { start: '10:05', end: '10:55', display: '10:05 AM' };
  }
  if (combined.includes('1:50') || combined.includes('1:50 pm')) {
    return { start: '13:50', end: '14:40', display: '1:50 PM' };
  }
  if (combined.includes('8:30') || combined.includes('8:30 am')) {
    return { start: '08:30', end: '09:20', display: '8:30 AM' };
  }

  return { start: '14:00', end: '15:00', display: '2:00 PM' };
}

/** Extracts target date from message or defaults to demo date */
function extractDate(message, history = []) {
  const combined = `${history.slice(-2).map((m) => m.content).join(' ')} ${message}`.toLowerCase();
  if (combined.includes('tomorrow')) {
    return { date: DEMO_TOMORROW_DATE, label: 'tomorrow' };
  }
  return { date: DEMO_DATE, label: 'today' };
}

/** Helper to match teaching slots for faculty by user.name */
async function findFacultySlots(user, dayFilter = null) {
  const targetFaculty = (user?.name || '').trim();
  const searchTerms = targetFaculty
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !['dr', 'prof', 'mr', 'mrs', 'ms'].includes(w.replace('.', '')));

  const query = {};
  if (dayFilter) query.day = dayFilter;
  if (user?.department && user.department !== 'ALL') query.department = user.department;

  const allSlots = await TimetableSlot.find(query).sort({ day: 1, sortOrder: 1 }).lean();

  return allSlots.filter((slot) => {
    if (!slot.faculty) return false;
    const fn = slot.faculty.toLowerCase();
    if (targetFaculty && fn.includes(targetFaculty.toLowerCase())) return true;
    return searchTerms.some((term) => fn.includes(term));
  });
}

/** Handles Grounded MongoDB Campus queries */
export async function handleCampusQuery(intent, rawMessage, user, history = []) {
  const norm = normalizeText(rawMessage);
  const dept = user.department || 'CSE';
  const year = user.year || 'III Year';

  // 1. NEXT_CLASS
  if (intent === 'NEXT_CLASS') {
    if (user.role === 'faculty') {
      const facultySlots = await findFacultySlots(user, DEMO_TODAY);
      if (facultySlots.length > 0) {
        const next = facultySlots[0];
        const course = next.title || next.label || next.acronym || 'Class';
        const venue = next.venue || 'TBA';
        return {
          message: `${user.name}, your next teaching session today (${DEMO_TODAY}) is ${course} from ${next.periodStart} to ${next.periodEnd} in venue ${venue} (${next.department} ${next.year}${next.batch ? ` Batch ${next.batch}` : ''}).`,
          data: { course, venue, startTime: next.periodStart, endTime: next.periodEnd, department: next.department, batch: next.batch },
        };
      }
      const allSlots = await findFacultySlots(user);
      if (allSlots.length > 0) {
        const firstUpcoming = allSlots[0];
        return {
          message: `${user.name}, you have no teaching sessions scheduled today (${DEMO_TODAY}). Your next scheduled teaching class is on ${firstUpcoming.day}: ${firstUpcoming.title || firstUpcoming.label} from ${firstUpcoming.periodStart} to ${firstUpcoming.periodEnd} in venue ${firstUpcoming.venue}.`,
          data: null,
        };
      }
      return {
        message: `${user.name}, you have no teaching sessions scheduled for today (${DEMO_TODAY}). You can verify all course allocations on your Teaching Schedule page.`,
        data: null,
      };
    }

    if (user.role === 'admin') {
      const count = await TimetableSlot.countDocuments({ day: DEMO_TODAY, kind: { $in: ['course', 'lab', 'elective'] } });
      return {
        message: `As Campus Administrator, you manage the institutional master schedule rather than attending classes. Today (${DEMO_TODAY}), there are ${count} active academic sessions across campus venues. View the Master Schedule page to monitor live venue occupancy.`,
        data: { activeToday: count },
      };
    }

    if (user.role === 'student' && dept && year) {
      const slots = await TimetableSlot.find({ department: dept, year, day: DEMO_TODAY, kind: { $in: ['course', 'lab'] } })
        .sort({ sortOrder: 1 });
      if (slots.length > 0) {
        const next = slots[0];
        const course = next.title || next.label;
        const venue = next.venue || 'TBA';
        const startTime = next.periodStart;
        const endTime = next.periodEnd;
        return {
          message: `Your next class today (${DEMO_TODAY}) is ${course} from ${startTime} to ${endTime} in venue ${venue}${next.faculty ? ` with ${next.faculty}` : ''}.`,
          data: { course, venue, startTime, endTime, faculty: next.faculty },
        };
      }
      return {
        message: `There are no scheduled teaching classes found for ${dept} ${year} today (${DEMO_TODAY}).`,
        data: null,
      };
    }
    return {
      message: `As a ${user.role}, you can view the complete schedule by opening the schedule page in the navigation menu.`,
      data: null,
    };
  }

  // 1b. UPCOMING_CLASSES
  if (intent === 'UPCOMING_CLASSES') {
    if (user.role === 'faculty') {
      const facultySlots = await findFacultySlots(user, DEMO_TODAY);
      if (facultySlots.length > 0) {
        const classItems = facultySlots
          .map((s) => {
            const title = s.title || s.label || s.acronym || 'Class';
            const venue = s.venue && s.venue !== '—' ? ` in venue ${s.venue}` : '';
            const batchInfo = s.batch ? ` (${s.department} ${s.year} Batch ${s.batch})` : ` (${s.department} ${s.year})`;
            return `• ${s.periodStart}–${s.periodEnd}: ${title}${venue}${batchInfo}`;
          })
          .join('\n');

        return {
          message: `Here are your upcoming teaching classes today (${DEMO_TODAY}) for ${user.name}:\n${classItems}`,
          data: { day: DEMO_TODAY, count: facultySlots.length, upcomingClasses: facultySlots },
        };
      }
      const allSlots = await findFacultySlots(user);
      const venues = Array.from(new Set(allSlots.map((s) => s.venue).filter((v) => v && v !== '—')));
      return {
        message: `${user.name}, you have no teaching classes scheduled today (${DEMO_TODAY}). You have ${allSlots.length} teaching sessions across the week in venues: ${venues.join(', ') || 'assigned labs'}.`,
        data: null,
      };
    }

    if (user.role === 'admin') {
      const count = await TimetableSlot.countDocuments({ day: DEMO_TODAY, kind: { $in: ['course', 'lab', 'elective'] } });
      return {
        message: `Campus Master Schedule overview for today (${DEMO_TODAY}): There are ${count} active academic class and lab sessions across all departments. Check the Master Schedule page to inspect room occupancy and faculty duty assignments.`,
        data: { activeToday: count },
      };
    }

    if (user.role === 'student' && dept && year) {
      const slots = await TimetableSlot.find({
        department: dept,
        year,
        day: DEMO_TODAY,
        kind: { $in: ['course', 'lab', 'elective'] },
      }).sort({ sortOrder: 1 });

      if (slots.length > 0) {
        const classItems = slots
          .map((s) => {
            const title = s.title || s.label || s.acronym || 'Class';
            const venue = s.venue && s.venue !== '—' ? ` in venue ${s.venue}` : '';
            const faculty = s.faculty && s.faculty !== '—' ? ` with ${s.faculty}` : '';
            return `• ${s.periodStart}–${s.periodEnd}: ${title}${venue}${faculty}`;
          })
          .join('\n');

        return {
          message: `Here are your upcoming classes today (${DEMO_TODAY}) for ${dept} ${year}:\n${classItems}`,
          data: { day: DEMO_TODAY, count: slots.length, upcomingClasses: slots },
        };
      }
      return {
        message: `You have no upcoming classes scheduled for today (${DEMO_TODAY}) for ${dept} ${year}.`,
        data: null,
      };
    }
    return {
      message: `As a ${user.role}, you can check department schedules and room allocations under the navigation menu.`,
      data: null,
    };
  }

  // 2. TIMETABLE (Today, Tomorrow, Upcoming Day, or specific day)
  if (intent === 'TIMETABLE') {
    // Determine target day:
    let targetDay = DEMO_TODAY; // 'Monday'
    let dayLabel = `today (${DEMO_TODAY})`;

    if (
      norm.includes('tomorrow') ||
      norm.includes('upcoming day') ||
      norm.includes('next day') ||
      norm.includes('upcoming date')
    ) {
      targetDay = 'Tuesday';
      dayLabel = 'tomorrow (Tuesday)';
    } else if (norm.includes('tuesday')) {
      targetDay = 'Tuesday';
      dayLabel = 'Tuesday';
    } else if (norm.includes('wednesday')) {
      targetDay = 'Wednesday';
      dayLabel = 'Wednesday';
    } else if (norm.includes('thursday')) {
      targetDay = 'Thursday';
      dayLabel = 'Thursday';
    } else if (norm.includes('friday')) {
      targetDay = 'Friday';
      dayLabel = 'Friday';
    } else if (norm.includes('saturday')) {
      targetDay = 'Saturday';
      dayLabel = 'Saturday';
    } else if (norm.includes('monday') || norm.includes('today')) {
      targetDay = 'Monday';
      dayLabel = `today (Monday)`;
    }

    if (user.role === 'faculty') {
      const facultySlots = await findFacultySlots(user, targetDay);
      if (facultySlots.length > 0) {
        const classList = facultySlots
          .map((s) => {
            const name = s.title || s.label || s.acronym;
            const venue = s.venue && s.venue !== '—' ? ` in venue ${s.venue}` : '';
            const batchInfo = s.batch ? ` (${s.department} ${s.year} Batch ${s.batch})` : ` (${s.department} ${s.year})`;
            return `• ${s.periodStart}–${s.periodEnd}: ${name}${venue}${batchInfo}`;
          })
          .join('\n');
        return {
          message: `Here is your teaching schedule for ${dayLabel} (${user.name}):\n${classList}\n\nYou can view your complete weekly teaching workload on the Teaching Schedule page.`,
          data: { targetDay, slotsCount: facultySlots.length },
        };
      }
      const allSlots = await findFacultySlots(user);
      const venues = Array.from(new Set(allSlots.map((s) => s.venue).filter((v) => v && v !== '—')));
      return {
        message: `${user.name}, you have no teaching sessions scheduled for ${dayLabel}. You have ${allSlots.length} total teaching sessions this week in venues: ${venues.join(', ') || 'assigned labs'}. View your full schedule on the Teaching Schedule page.`,
        data: null,
      };
    }

    if (user.role === 'admin') {
      const count = await TimetableSlot.countDocuments({ day: targetDay, kind: { $in: ['course', 'lab', 'elective'] } });
      return {
        message: `Institutional Master Schedule for ${dayLabel}: Across all campus venues, ${count} academic periods are scheduled. As Administrator, you can view the complete hall occupancy matrix and faculty duty assignments on the Master Schedule page.`,
        data: { targetDay, count },
      };
    }

    // Check if student asking about class after lunch
    if (norm.includes('after lunch')) {
      const afterLunchSlot = await TimetableSlot.findOne({
        department: dept,
        year,
        day: DEMO_TODAY,
        periodStart: { $gte: '13:00' },
        kind: { $in: ['course', 'lab'] },
      }).sort({ sortOrder: 1 });

      if (afterLunchSlot) {
        return {
          message: `The class after lunch today (${DEMO_TODAY}) is ${afterLunchSlot.title || afterLunchSlot.label} (${afterLunchSlot.acronym || afterLunchSlot.code}) in venue ${afterLunchSlot.venue} from ${afterLunchSlot.periodStart} to ${afterLunchSlot.periodEnd}.`,
          data: afterLunchSlot,
        };
      }
    }

    // Full target day's schedule for students
    const slots = await TimetableSlot.find({ department: dept, year, day: targetDay }).sort({ sortOrder: 1 });
    if (slots.length > 0) {
      const classList = slots
        .filter((s) => s.kind === 'course' || s.kind === 'lab' || s.kind === 'elective')
        .map((s) => {
          const name = s.title || s.label || s.acronym;
          const venue = s.venue && s.venue !== '—' ? ` in venue ${s.venue}` : '';
          const faculty = s.faculty && s.faculty !== '—' ? ` with ${s.faculty}` : '';
          return `• ${s.periodStart}–${s.periodEnd}: ${name}${venue}${faculty}`;
        })
        .join('\n');
      return {
        message: `Here is the schedule for ${dayLabel} for ${dept} ${year}:\n${classList}\n\nTip: You can specify batch B1, B2, or B3 for lab-specific periods, or view the full week on the My Timetable page.`,
        data: { targetDay, slotsCount: slots.length },
      };
    }
    return {
      message: `No uploaded timetable found for ${dept} ${year} on ${targetDay}.`,
      data: null,
    };
  }


  // 3. COURSE_LOOKUP
  if (intent === 'COURSE_LOOKUP') {
    const courses = [
      { key: 'ooad', pattern: /ooad|object\s*oriented/i, name: 'Object Oriented Analysis and Design' },
      { key: 'devops', pattern: /devops|agile/i, name: 'DevOps and Agile Methodologies' },
      { key: 'cloud', pattern: /cloud/i, name: 'Cloud Computing' },
      { key: 'compiler', pattern: /compiler/i, name: 'Compiler Design' },
      { key: 'ai', pattern: /ai|artificial\s*intelligence/i, name: 'Artificial Intelligence' },
      { key: 'wt', pattern: /web|wt/i, name: 'Web Technology' },
    ];

    const matchCourse = courses.find((c) => c.pattern.test(rawMessage));
    if (matchCourse) {
      const courseSlots = await TimetableSlot.find({
        department: dept,
        year,
        $or: [{ acronym: new RegExp(matchCourse.key, 'i') }, { title: matchCourse.pattern }],
      }).sort({ sortOrder: 1 });

      if (courseSlots.length > 0) {
        const primary = courseSlots[0];
        const times = courseSlots.map((s) => `${s.day} ${s.periodStart}–${s.periodEnd}`).slice(0, 3).join(', ');
        return {
          message: `${primary.title || matchCourse.name} (${primary.acronym || primary.code}) is held in venue ${primary.venue} (${times})${primary.faculty ? ` with ${primary.faculty}` : ''}.`,
          data: { course: primary.title, venue: primary.venue, faculty: primary.faculty },
        };
      }
    }

    // If specific course wasn't found
    const queriedName = rawMessage.replace(/where is|what is the venue for|venue for/gi, '').trim();
    return {
      message: `I couldn't find "${queriedName}" in the current ${dept} ${year} timetable. Check the Timetable page for the full course directory.`,
      data: null,
    };
  }

  // 4. SMART_CLASSROOM
  if (intent === 'SMART_CLASSROOM') {
    const smartRooms = await Classroom.find({ smart: true, status: 'available' });
    const list = smartRooms.map((r) => `• ${r._id} (${r.department}, Capacity: ${r.capacity})`).join('\n');
    return {
      message: `The available Smart Classrooms equipped with interactive digital boards and projectors are:\n${list}\n\nAll ${smartRooms.length} rooms are currently active and available for teaching and presentation sessions.`,
      data: { smartRooms: smartRooms.map((r) => r._id) },
    };
  }

  // 5. CLASSROOM_AVAILABILITY (including short-term context e.g. "What about F14?")
  if (intent === 'CLASSROOM_AVAILABILITY') {
    // Check if user is asking "Who booked F12?"
    if (norm.includes('who booked')) {
      const roomMatch = rawMessage.match(/\b([fgs]\d+|hall\s*\d+|icl|cvr|cadm)\b/i);
      const targetRoom = roomMatch ? roomMatch[1].toUpperCase().replace(/\s+/g, '') : 'F12';
      const bookings = await Booking.find({ room: targetRoom, status: { $ne: 'cancelled' } }).sort({ date: 1, startTime: 1 });
      if (bookings.length > 0) {
        const bList = bookings.map((b) => `• ${b.date} ${b.startTime}–${b.endTime}: ${b.purpose} (booked by ${b.userName || 'Faculty'})`).join('\n');
        return {
          message: `Active bookings for classroom ${targetRoom}:\n${bList}`,
          data: { bookings },
        };
      }
      return {
        message: `Classroom ${targetRoom} currently has no scheduled bookings in the system.`,
        data: null,
      };
    }

    // Extract room
    const roomMatch = rawMessage.match(/\b([fgs]\d+|hall\s*\d+|icl|cvr|cadm)\b/i);
    const timeInfo = extractTimeWindow(rawMessage, history);
    const dateInfo = extractDate(rawMessage, history);

    if (roomMatch) {
      const targetRoom = roomMatch[1].toUpperCase().replace(/\s+/g, '');
      const roomDoc = await Classroom.findById(targetRoom);
      if (!roomDoc) {
        return {
          message: `I couldn't find classroom ${targetRoom} in the campus directory.`,
          data: null,
        };
      }

      if (roomDoc.status === 'maintenance') {
        return {
          message: `Classroom ${roomDoc._id} is currently under maintenance. Suggested alternatives: F14 (Smart), F9 (Smart).`,
          data: { room: roomDoc._id, status: 'maintenance' },
        };
      }
      if (roomDoc.status === 'blocked') {
        return {
          message: `Classroom ${roomDoc._id} is currently blocked by administration.`,
          data: { room: roomDoc._id, status: 'blocked' },
        };
      }

      // Check booking conflicts
      const conflict = await Booking.findOne({
        room: roomDoc._id,
        date: dateInfo.date,
        status: { $ne: 'cancelled' },
        startTime: { $lt: timeInfo.end },
        endTime: { $gt: timeInfo.start },
      });

      if (conflict) {
        return {
          message: `${roomDoc._id} is occupied ${dateInfo.label} from ${conflict.startTime} to ${conflict.endTime} (${conflict.purpose || 'Scheduled Session'}). Suggested alternative: F14 is available during that period.`,
          data: { available: false, room: roomDoc._id, conflict },
        };
      }

      return {
        message: `Yes, ${roomDoc._id} is available at ${timeInfo.display} (${roomDoc.department}, capacity ${roomDoc.capacity}, ${roomDoc.smart ? 'Smart Classroom' : 'Standard Room'}).`,
        data: { available: true, room: roomDoc._id, time: timeInfo.display },
      };
    }

    // General availability inquiry e.g. "Which classrooms are free at 2 PM?" or "Show CSE classrooms"
    const availableRooms = await Classroom.find({ status: 'available' });
    const conflictingBookings = await Booking.find({
      date: dateInfo.date,
      status: { $ne: 'cancelled' },
      startTime: { $lt: timeInfo.end },
      endTime: { $gt: timeInfo.start },
    });
    const occupiedRoomIds = new Set(conflictingBookings.map((b) => b.room));
    const freeRooms = availableRooms.filter((r) => !occupiedRoomIds.has(r._id));

    const sample = freeRooms.slice(0, 6).map((r) => `${r._id}${r.smart ? ' (Smart)' : ''} [${r.department}]`).join(', ');
    return {
      message: `At ${timeInfo.display} on campus, ${freeRooms.length} classrooms are currently available. Top recommendations: ${sample}.`,
      data: { freeCount: freeRooms.length, time: timeInfo.display },
    };
  }

  // 6. VENUE_CHANGE
  if (intent === 'VENUE_CHANGE') {
    const notices = await VenueChangeNotice.find({ department: dept });
    if (notices.length > 0) {
      const n = notices[0];
      return {
        message: `Active venue change for ${dept}: ${n.course} moved from ${n.oldVenue} to ${n.newVenue} during ${n.timeRange || n.period} (${n.reason}).`,
        data: notices,
      };
    }

    // Check if user specifically asked about F12
    if (norm.includes('f12')) {
      const f12Notice = await VenueChangeNotice.findOne({ $or: [{ oldVenue: 'F12' }, { newVenue: 'F12' }] });
      if (f12Notice) {
        return {
          message: `Yes, F12 has an active venue change: ${f12Notice.course} moved from ${f12Notice.oldVenue} to ${f12Notice.newVenue} during ${f12Notice.timeRange || f12Notice.period} (${f12Notice.reason}).`,
          data: f12Notice,
        };
      }
    }

    return {
      message: `There are no active venue changes reported for ${dept} today.`,
      data: null,
    };
  }

  // 7. BOOKING_GUIDE
  if (intent === 'BOOKING_GUIDE') {
    if (user.role === 'student') {
      return {
        message: `Classroom bookings can only be requested by Faculty members and Academic Administrators. If you need a room for a student activity or seminar, please contact your faculty advisor.`,
        data: null,
      };
    }
    return {
      message: `To book a classroom:\n1. Open "Smart Allocation" from the sidebar.\n2. Select Date, Start/End times, Student count, and required Facilities (e.g. Smart Board, Projector).\n3. Click "Find Best Classroom" to see ranked rooms with match scores.\n4. Click "Allocate" to confirm your conflict-free booking!`,
      data: null,
    };
  }

  // 8. SMART_ALLOCATION_RECOMMEND (Section 15 Integration)
  if (intent === 'SMART_ALLOCATION_RECOMMEND') {
    const studentCountMatch = rawMessage.match(/\b(\d{2,3})\s*(?:students?|seats?|people)?\b/i);
    const requestedCount = studentCountMatch ? parseInt(studentCountMatch[1], 10) : 60;
    const isSmart = norm.includes('smart');
    const timeInfo = extractTimeWindow(rawMessage, history);
    const dateInfo = extractDate(rawMessage, history);

    const candidateRooms = await Classroom.find({ status: { $ne: 'maintenance' } });
    const conflictingBookings = await Booking.find({
      date: dateInfo.date,
      status: { $ne: 'cancelled' },
      startTime: { $lt: timeInfo.end },
      endTime: { $gt: timeInfo.start },
    });
    const occupiedSet = new Set(conflictingBookings.map((b) => b.room));

    const scoredRooms = candidateRooms.map((room) => {
      let score = 0;
      // Capacity
      if (room.capacity >= requestedCount) {
        score += Math.max(10, 35 - Math.min(25, (room.capacity - requestedCount) * 1.5));
      } else {
        score += Math.max(0, 35 - (requestedCount - room.capacity) * 2);
      }
      // Availability
      const isAvailable = room.status === 'available' && !occupiedSet.has(room._id);
      if (isAvailable) score += 30;
      // Facilities / Smart
      if (room.smart) score += isSmart ? 25 : 15;
      else score += isSmart ? 0 : 20;
      // Department
      if (room.department === dept) score += 10;

      const total = Math.min(99, Math.round(score));
      return { room, total, isAvailable };
    });

    scoredRooms.sort((a, b) => b.total - a.total);
    const top3 = scoredRooms.slice(0, 3);

    if (top3.length > 0) {
      const best = top3[0];
      const list = top3.map((m) => `• ${m.room._id} — ${m.total}% match`).join('\n');
      return {
        message: `I found ${top3.length} suitable classrooms for ${dateInfo.label} at ${timeInfo.display}:\n\n${list}\n\n${best.room._id} is the best match because it meets the capacity (${best.room.capacity} seats for ${requestedCount} students) and ${isSmart ? 'smart-classroom requirements' : 'scheduling criteria'} with zero conflicts.`,
        data: { recommendations: top3 },
      };
    }
  }

  // 9. RECENT_BOOKINGS & RECENTLY_ACCESSED
  if (intent === 'RECENT_BOOKINGS') {
    const bookings = await Booking.find({ userId: user.id, status: { $ne: 'cancelled' } }).sort({ date: -1 }).limit(4);
    if (bookings.length > 0) {
      const bList = bookings.map((b) => `• Room ${b.room} on ${b.date} (${b.startTime}–${b.endTime}): ${b.purpose}`).join('\n');
      return {
        message: `Your recent bookings:\n${bList}`,
        data: bookings,
      };
    }
    return {
      message: `You do not have any active or past bookings recorded yet.`,
      data: null,
    };
  }

  if (intent === 'RECENTLY_ACCESSED') {
    const recent = await RecentlyViewed.find({ userId: user.id }).sort({ accessedAt: -1 }).limit(5);
    if (recent.length > 0) {
      const rList = recent.map((r) => `• ${r.resourceName} (${r.resourceType})`).join('\n');
      return {
        message: `Here are the items you recently accessed in Sam Campus Slot:\n${rList}`,
        data: recent,
      };
    }
    return {
      message: `You haven't viewed any classrooms or timetables recently.`,
      data: null,
    };
  }

  // Fallback for campus query with no match
  return {
    message: `I couldn't find matching campus records for that request in the ${dept} database. You can try asking about your next class, available classrooms at 2 PM, smart classrooms, or venue changes!`,
    data: null,
  };
}
