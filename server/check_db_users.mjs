import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/sam_campus_slot');
  const users = await mongoose.connection.db.collection('users').find().toArray();
  console.log('Total users in DB:', users.length);
  for (const u of users) {
    const isStudentPass = await bcrypt.compare('student123', u.passwordHash || '');
    const isAdminPass = await bcrypt.compare('admin123', u.passwordHash || '');
    const isFacultyPass = await bcrypt.compare('faculty123', u.passwordHash || '');
    console.log(`User: ${u.email} | role: ${u.role} | student123: ${isStudentPass} | admin123: ${isAdminPass} | faculty123: ${isFacultyPass}`);
  }
  await mongoose.disconnect();
}
check().catch(console.error);
