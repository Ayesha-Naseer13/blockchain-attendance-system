import mongoose from "mongoose"

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: String,
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  blockchain: {
    chain: [
      {
        index: Number,
        timestamp: String,
        transactions: mongoose.Schema.Types.Mixed,
        prev_hash: String,
        nonce: Number,
        hash: String,
      },
    ],
  },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("Student", studentSchema)
