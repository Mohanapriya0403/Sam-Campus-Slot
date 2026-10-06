import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sam_campus_slot';

// A single shared Mongoose connection. Call this once before the app starts
// serving requests (see server.js). Models attach to this default connection
// automatically since they're defined with `mongoose.model(...)`.
export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB (${MONGODB_URI})`);
  return mongoose.connection;
}

export default mongoose;
