import mongoose from "mongoose"

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: String,
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

export default mongoose.model("Department", departmentSchema)
