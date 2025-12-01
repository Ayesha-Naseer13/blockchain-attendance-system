import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
  date: { type: Date, default: Date.now },
  blockData: {
    index: Number,
    timestamp: String,
    prev_hash: String,
    nonce: Number,
    hash: String,
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Attendance", attendanceSchema)
