import express from "express"
import Attendance from "../models/Attendance.js"
import Student from "../models/Student.js"
import { BlockchainService } from "../services/blockchainService.js"

const router = express.Router()

// Mark attendance for a student
router.post("/", async (req, res) => {
  try {
    const { studentId, status, date } = req.body

    // Get student to find classId and departmentId
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ success: false, error: "Student not found" })
    }

    // Add attendance block to student's blockchain
    const newBlock = await BlockchainService.addAttendanceBlock(studentId, {
      status,
      date: date || new Date().toISOString(),
      student_name: student.name,
      roll_number: student.rollNumber,
      department_id: student.departmentId,
      class_id: student.classId,
    })

    // Create attendance record
    const attendance = new Attendance({
      studentId,
      classId: student.classId,
      departmentId: student.departmentId,
      status,
      date: date || new Date(),
      blockData: {
        index: newBlock.index,
        timestamp: newBlock.timestamp,
        prev_hash: newBlock.prev_hash,
        nonce: newBlock.nonce,
        hash: newBlock.hash,
      },
    })

    await attendance.save()

    res.status(201).json({
      success: true,
      data: attendance,
      blockInfo: {
        hash: newBlock.hash,
        nonce: newBlock.nonce,
        timestamp: newBlock.timestamp,
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Get attendance for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const startDate = new Date(req.params.date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(req.params.date)
    endDate.setHours(23, 59, 59, 999)

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("studentId")
      .populate("classId")
      .populate("departmentId")

    res.json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get attendance for a class
router.get("/class/:classId", async (req, res) => {
  try {
    const records = await Attendance.find({ classId: req.params.classId })
      .populate("studentId")
      .populate("classId")
      .populate("departmentId")
      .sort({ date: -1 })

    res.json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get attendance for a department
router.get("/department/:departmentId", async (req, res) => {
  try {
    const records = await Attendance.find({ departmentId: req.params.departmentId })
      .populate("studentId")
      .populate("classId")
      .populate("departmentId")
      .sort({ date: -1 })

    res.json({ success: true, data: records })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get attendance history for a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
    if (!student) {
      return res.status(404).json({ success: false, error: "Student not found" })
    }

    // Reconstruct student blockchain
    const blockchain = BlockchainService.reconstructBlockchain(
      student.blockchain.chain,
      `Student-${req.params.studentId}`,
    )

    // Get all attendance blocks
    const attendanceBlocks = blockchain.chain.filter((block) => block.transactions.type === "attendance")

    // Get attendance records from DB
    const attendanceRecords = await Attendance.find({
      studentId: req.params.studentId,
    }).sort({ date: -1 })

    res.json({
      success: true,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
      },
      blockchainHistory: attendanceBlocks.map((block) => ({
        blockIndex: block.index,
        timestamp: block.timestamp,
        status: block.transactions.attendance.status,
        hash: block.hash,
        prev_hash: block.prev_hash,
        nonce: block.nonce,
      })),
      databaseRecords: attendanceRecords,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
