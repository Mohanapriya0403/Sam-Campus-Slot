// Seeds the database from the SAME data the frontend was already shipping —
// nothing here is re-typed or re-derived.
//
// Usage: npm run db:seed
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './connect.js';

import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import TimetableSlot from '../models/TimetableSlot.js';
import DepartmentYear from '../models/DepartmentYear.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import Notification from '../models/Notification.js';
import VenueChangeNotice from '../models/VenueChangeNotice.js';
import AnalyticsCache from '../models/AnalyticsCache.js';
import RecentlyViewed from '../models/RecentlyViewed.js';

import { departmentTimetables, getSemesterLabel, getAvailableBatches } from '../../seed-data/timetableSource.js';
import { allClassrooms } from '../../seed-data/cseVenues.js';
import { demoUsers } from '../../seed-data/users.js';
import { bookings, occupiedSlots } from '../../seed-data/bookings.js';
import { notifications, venueChangeNoticeByDepartment } from '../../seed-data/notifications.js';
import * as analytics from '../../seed-data/analytics.js';

async function seedUsers() {
  console.log(`Seeding ${demoUsers.length} demo users (passwords hashed)...`);
  const demoIds = demoUsers.map((u) => u.id);
  // Delete any extraneous accounts so exactly 5 demo accounts exist initially
  await User.deleteMany({ _id: { $nin: demoIds } });

  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.findByIdAndUpdate(
      u.id,
      {
        _id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        department: u.department || null,
        year: u.year || null,
        avatarColor: u.avatarColor || null,
      },
      { upsert: true }
    );
  }
}

async function seedClassrooms() {
  console.log(`Seeding ${allClassrooms.length} classrooms...`);
  for (const room of allClassrooms) {
    await Classroom.findByIdAndUpdate(
      room.id,
      {
        _id: room.id,
        department: room.department,
        floor: room.floor || null,
        floorId: room.floorId || null,
        smart: !!room.smart,
        special: room.special || null,
        capacity: room.capacity ?? null,
        facilities: room.facilities || [],
        status: room.status || 'available',
        isSample: !!room.isSample,
        isPlaceholder: !!room.isPlaceholder,
      },
      { upsert: true }
    );
  }
}

async function seedTimetables() {
  console.log('Flattening department timetables into timetable slots...');
  let rowCount = 0;
  for (const [department, years] of Object.entries(departmentTimetables)) {
    for (const [year, batches] of Object.entries(years)) {
      const batchKeys = Object.keys(batches);
      if (batchKeys.length === 0) continue;

      await DepartmentYear.findOneAndUpdate(
        { department, year },
        {
          department,
          year,
          semester: getSemesterLabel(department),
          batches: getAvailableBatches(department, year),
        },
        { upsert: true }
      );

      for (const batch of batchKeys) {
        const week = batches[batch];
        for (const [day, slots] of Object.entries(week)) {
          for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            await TimetableSlot.create({
              department,
              year,
              batch,
              day,
              periodId: slot.period.id,
              periodStart: slot.period.start,
              periodEnd: slot.period.end,
              sortOrder: i,
              kind: slot.kind,
              acronym: slot.acronym || null,
              title: slot.title || null,
              code: slot.code || null,
              label: slot.label || null,
              faculty: slot.faculty || null,
              venue: slot.venue || null,
              options: slot.options || null,
            });
            rowCount++;
          }
        }
      }
    }
  }
  console.log(`Inserted ${rowCount} timetable slot documents.`);
}

async function seedBookings() {
  console.log(`Seeding ${bookings.length} bookings and ${occupiedSlots.length} blocked slots...`);
  for (const b of bookings) {
    await Booking.findByIdAndUpdate(
      b.id,
      {
        _id: b.id,
        room: b.room,
        facultyId: b.facultyId,
        date: b.date,
        startTime: b.start,
        endTime: b.end,
        purpose: b.purpose,
        status: b.status,
      },
      { upsert: true }
    );
  }
  for (const s of occupiedSlots) {
    await BlockedSlot.create({ room: s.room, date: s.date, startTime: s.start, endTime: s.end, reason: s.reason || null });
  }
}

async function seedNotifications() {
  console.log(`Seeding ${notifications.length} notifications...`);
  for (const n of notifications) {
    await Notification.findByIdAndUpdate(
      n.id,
      { _id: n.id, department: n.department, type: n.type, title: n.title, message: n.message, isRead: !!n.read },
      { upsert: true }
    );
  }
  for (const [department, notice] of Object.entries(venueChangeNoticeByDepartment)) {
    await VenueChangeNotice.findByIdAndUpdate(
      department,
      {
        _id: department,
        department: notice.department || department,
        year: notice.year || null,
        batch: notice.batch || null,
        course: notice.course,
        date: notice.date || null,
        period: notice.period || null,
        oldVenue: notice.oldVenue,
        newVenue: notice.newVenue,
        timeRange: notice.timeRange || notice.time,
        reason: notice.reason,
      },
      { upsert: true }
    );
  }
}

async function seedRecentlyViewed() {
  console.log('Seeding demo recently accessed records...');
  const now = new Date();
  const demoViews = [
    {
      _id: 'u2:classroom:F12',
      userId: 'u2',
      user: 'u2',
      resourceType: 'classroom',
      resourceId: 'F12',
      resourceName: 'F12 Classroom',
      room: 'F12',
      department: 'CSE',
      accessedAt: new Date(now.getTime() - 25 * 60 * 1000), // 25 mins ago
      viewedAt: new Date(now.getTime() - 25 * 60 * 1000),
      metadata: { floor: 'First Floor', smart: true, status: 'available' },
    },
    {
      _id: 'u2:timetable:CSE-III Year',
      userId: 'u2',
      user: 'u2',
      resourceType: 'timetable',
      resourceId: 'CSE-III Year',
      resourceName: 'CSE III Year Timetable',
      department: 'CSE',
      accessedAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
      viewedAt: new Date(now.getTime() - 45 * 60 * 1000),
      metadata: { department: 'CSE', year: 'III Year' },
    },
    {
      _id: 'u2:allocation:smart-allocation',
      userId: 'u2',
      user: 'u2',
      resourceType: 'allocation',
      resourceId: 'smart-allocation',
      resourceName: 'Smart Allocation',
      department: 'CSE',
      accessedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      viewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      metadata: { link: '/faculty/allocation' },
    },
    {
      _id: 'u1:classroom:F14',
      userId: 'u1',
      user: 'u1',
      resourceType: 'classroom',
      resourceId: 'F14',
      resourceName: 'F14 Classroom',
      room: 'F14',
      department: 'CSE',
      accessedAt: new Date(now.getTime() - 10 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 10 * 60 * 1000),
      metadata: { floor: 'First Floor', smart: true, status: 'available' },
    },
    {
      _id: 'u1:allocation:smart-allocation',
      userId: 'u1',
      user: 'u1',
      resourceType: 'allocation',
      resourceId: 'smart-allocation',
      resourceName: 'Smart Allocation',
      department: 'CSE',
      accessedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      viewedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      metadata: { link: '/faculty/allocation' },
    },
  ];

  for (const v of demoViews) {
    await RecentlyViewed.findByIdAndUpdate(v._id, v, { upsert: true });
  }
}

async function seedAnalytics() {
  const metrics = {
    weeklyUtilization: analytics.weeklyUtilization,
    departmentUtilization: analytics.departmentUtilization,
    floorUtilization: analytics.floorUtilization,
    smartClassroomUsage: analytics.smartClassroomUsage,
    peakHours: analytics.peakHours,
    roomStatusSplit: analytics.roomStatusSplit,
    mostUsedRooms: analytics.mostUsedRooms,
    leastUsedRooms: analytics.leastUsedRooms,
    crossDeptBookings: analytics.crossDeptBookings,
  };
  console.log(`Seeding ${Object.keys(metrics).length} analytics metrics...`);
  for (const [key, payload] of Object.entries(metrics)) {
    await AnalyticsCache.findByIdAndUpdate(key, { _id: key, payload }, { upsert: true });
  }
}

async function main() {
  await connectDB();
  try {
    console.log('Clearing existing documents (idempotent re-seed)...');
    await Promise.all([
      User.deleteMany({}),
      Classroom.deleteMany({}),
      TimetableSlot.deleteMany({}),
      DepartmentYear.deleteMany({}),
      Booking.deleteMany({}),
      BlockedSlot.deleteMany({}),
      Notification.deleteMany({}),
      VenueChangeNotice.deleteMany({}),
      AnalyticsCache.deleteMany({}),
      RecentlyViewed.deleteMany({}),
    ]);

    await seedUsers();
    await seedClassrooms();
    await seedTimetables();
    await seedBookings();
    await seedNotifications();
    await seedRecentlyViewed();
    await seedAnalytics();

    console.log('\nSeed complete. Demo logins:');
    for (const u of demoUsers) console.log(`  ${u.role.padEnd(8)} ${u.email} / ${u.password}`);
  } finally {
    await mongoose.connection.close();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
