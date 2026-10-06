import mongoose from 'mongoose';

// Which semester label and which batches exist for a department + year —
// lets the API answer "what batches does MECH III Year have?" without
// scanning every timetable slot document.
const departmentYearSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batches: { type: [String], required: true }, // e.g. ["B1","B2","B3"]
});

departmentYearSchema.index({ department: 1, year: 1 }, { unique: true });

export default mongoose.model('DepartmentYear', departmentYearSchema);
