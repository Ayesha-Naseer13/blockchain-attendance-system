import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Import routes
import departmentRoutes from "./routes/departments.js"
import classRoutes from "./routes/classes.js"
import studentRoutes from "./routes/students.js"
import attendanceRoutes from "./routes/attendance.js"
import validationRoutes from "./routes/validation.js"

// Use routes
app.use("/api/departments", departmentRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/validation", validationRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
