import express from "express"
import Student from "../models/Student.js"
import { BlockchainService } from "../services/blockchainService.js"

const router = express.Router()

// Create student
router.post("/", async (req, res) => {
  try {
    const { name, rollNumber, email, departmentId, classId } = req.body

    const newStudent = new Student({
      name,
      rollNumber,
      email,
      departmentId,
      classId,
      blockchain: { chain: [] },
    })

    await newStudent.save()

    // Create blockchain for student (child of class)
    await BlockchainService.createStudentBlockchain(newStudent._id, { name, rollNumber, email }, classId, departmentId)

    const student = await Student.findById(newStudent._id).populate("departmentId").populate("classId")
    res.status(201).json({ success: true, data: student })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({ status: "active" }).populate("departmentId").populate("classId")
    res.json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get students by class
router.get("/class/:classId", async (req, res) => {
  try {
    const students = await Student.find({
      classId: req.params.classId,
      status: "active",
    })
      .populate("departmentId")
      .populate("classId")
    res.json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Search student by name or roll number
router.get("/search/:query", async (req, res) => {
  try {
    const students = await Student.find({
      $or: [
        { name: { $regex: req.params.query, $options: "i" } },
        { rollNumber: { $regex: req.params.query, $options: "i" } },
      ],
      status: "active",
    })
      .populate("departmentId")
      .populate("classId")
    res.json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("departmentId").populate("classId")
    res.json({ success: true, data: student })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update student
router.put("/:id", async (req, res) => {
  try {
    const { name, rollNumber, email } = req.body

    await BlockchainService.addUpdateBlock(req.params.id, "Student", {
      name,
      rollNumber,
      email,
      status: "updated",
    })

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, email, updatedAt: new Date() },
      { new: true },
    )
      .populate("departmentId")
      .populate("classId")

    res.json({ success: true, data: student })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    await BlockchainService.addUpdateBlock(req.params.id, "Student", {
      status: "deleted",
    })

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: "deleted", updatedAt: new Date() },
      { new: true },
    )
      .populate("departmentId")
      .populate("classId")

    res.json({ success: true, data: student, message: "Student marked as deleted" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
