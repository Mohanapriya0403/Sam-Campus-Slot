import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { connectDB } from './server/src/db/connect.js';
import User from './server/src/models/User.js';

const SCREENSHOT_DIR = path.resolve('screenshots');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4000/api';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`API login failed for ${email}`);
  return await res.json();
}

async function setSession(page, token, user) {
  await page.evaluate((t, u) => {
    localStorage.setItem('sam-campus-slot-token', t);
    localStorage.setItem('sam-campus-slot-user', JSON.stringify(u));
  }, token, user);
}

async function clearSession(page) {
  await page.evaluate(() => {
    localStorage.removeItem('sam-campus-slot-token');
    localStorage.removeItem('sam-campus-slot-user');
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setStudentDeptYear(department, year, semester = 'Odd Semester') {
  await User.findOneAndUpdate(
    { email: 'student@sam.edu' },
    { department, year, semester }
  );
}

async function run() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Logging in demo accounts via API...');
  const facultyAuth = await apiLogin('faculty@sam.edu', 'faculty123');
  const adminAuth = await apiLogin('admin@sam.edu', 'admin123');

  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();

  async function snap(filename, fullPage = false) {
    const filePath = path.join(SCREENSHOT_DIR, filename);
    await sleep(900);
    await page.screenshot({ path: filePath, fullPage });
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // 1. Landing Page
    console.log('1. Capturing Landing Page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await clearSession(page);
    await snap('01_landing_page.png');

    // 2. Login Page
    console.log('2. Capturing Login Page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await snap('02_login_page.png');

    // 3. Login Page with Password Visibility Toggle active
    console.log('3. Capturing Login Page (Password Unmasked)...');
    const pwdInput = await page.$('input[type="password"]');
    if (pwdInput) {
      await pwdInput.click({ clickCount: 3 });
      await pwdInput.type('student123');
      const allButtons = await page.$$('button[type="button"]');
      for (const btn of allButtons) {
        const svg = await btn.$('svg');
        if (svg) {
          const parent = await btn.evaluateHandle((el) => el.parentElement);
          const hasInput = await parent.evaluate((el) => !!el.querySelector('input'));
          if (hasInput) {
            await btn.click();
            break;
          }
        }
      }
    }
    await snap('03_login_password_unmasked.png');

    // Helper for student timetable captures
    async function captureStudentTimetable(dept, yr, filename) {
      console.log(`Capturing ${dept} ${yr} Timetable...`);
      await setStudentDeptYear(dept, yr);
      const studentAuth = await apiLogin('student@sam.edu', 'student123');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await setSession(page, studentAuth.token, studentAuth.user);
      await page.goto(`${BASE_URL}/student/timetable`, { waitUntil: 'networkidle0' });
      await sleep(1500);

      // Click 'Week' view button
      for (const btn of await page.$$('button')) {
        const text = await btn.evaluate((el) => el.textContent);
        if (text.includes('Week')) {
          await btn.click();
          break;
        }
      }
      await sleep(1000);
      await snap(filename);
    }

    // 4. ECE II Year Timetable
    await captureStudentTimetable('ECE', 'II Year', '04_student_timetable_ece_ii_year.png');

    // 5. CSE II Year Timetable
    await captureStudentTimetable('CSE', 'II Year', '05_student_timetable_cse_ii_year.png');

    // 6. MECH II Year Timetable
    await captureStudentTimetable('MECH', 'II Year', '06_student_timetable_mech_ii_year.png');

    // 7. IT II Year Timetable
    await captureStudentTimetable('IT', 'II Year', '07_student_timetable_it_ii_year.png');

    // 8. AI&DS II Year Timetable
    await captureStudentTimetable('AIDS', 'II Year', '08_student_timetable_aids_ii_year.png');

    // 9. Student Venue Page (Reset to CSE III Year)
    console.log('9. Capturing Student Venue Page...');
    await setStudentDeptYear('CSE', 'III Year');
    const studentAuth = await apiLogin('student@sam.edu', 'student123');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await setSession(page, studentAuth.token, studentAuth.user);
    await page.goto(`${BASE_URL}/student/venue`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await snap('09_student_venue_page.png');

    // 10. Faculty Teaching Schedule
    console.log('10. Capturing Faculty Teaching Schedule...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await setSession(page, facultyAuth.token, facultyAuth.user);
    await page.goto(`${BASE_URL}/faculty/timetable`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await snap('10_faculty_teaching_schedule.png');

    // 11. Faculty Smart Allocation
    console.log('11. Capturing Faculty Smart Allocation with match results...');
    await page.goto(`${BASE_URL}/faculty/allocation`, { waitUntil: 'networkidle0' });
    await sleep(1200);
    // Click Evaluate & Match Best Classroom
    for (const btn of await page.$$('button')) {
      const text = await btn.evaluate((el) => el.textContent);
      if (text.includes('Evaluate & Match') || text.includes('Recommend') || text.includes('Find')) {
        await btn.click();
        break;
      }
    }
    await sleep(1500);
    await snap('11_faculty_smart_allocation.png');

    // 12. Admin Analytics Dashboard
    console.log('12. Capturing Admin Analytics Dashboard...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await setSession(page, adminAuth.token, adminAuth.user);
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    await sleep(1800);
    await snap('12_admin_analytics_dashboard.png');

    // 13. Admin Master Venue Matrix
    console.log('13. Capturing Admin Master Venue Matrix...');
    await page.goto(`${BASE_URL}/admin/timetable`, { waitUntil: 'networkidle0' });
    await sleep(1800);
    await snap('13_admin_master_venue_matrix.png');

    // 14. Admin Manage Users (with filter columns)
    console.log('14. Capturing Admin Manage Users...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle0' });
    await sleep(1500);
    await snap('14_admin_users_filtered.png');

    // 15. Campus Assistant Chatbot
    console.log('15. Capturing Campus Assistant Chatbot with conversation...');
    const chatBtn = await page.$('button.fixed');
    if (chatBtn) {
      await chatBtn.click();
      await sleep(1000);
      const chatInput = await page.$('div.fixed input');
      if (chatInput) {
        await chatInput.type('Where is my next class?');
        await page.keyboard.press('Enter');
        await sleep(3000);
      }
    }
    await snap('15_campus_assistant_chatbot.png');

    console.log('\nAll 15 screenshots captured and verified successfully!');
  } finally {
    // Reset student back to CSE III Year
    await setStudentDeptYear('CSE', 'III Year');
    await browser.close();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
