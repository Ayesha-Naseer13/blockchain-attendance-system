import express from "express"
import { BlockchainService } from "../services/blockchainService.js"
import Department from "../models/Department.js"
import Class from "../models/Class.js"
import Student from "../models/Student.js"

const router = express.Router()

// Validate all chains in the system
router.get("/all", async (req, res) => {
  try {
    const validationReport = await BlockchainService.validateAllChains()
    res.json({ success: true, data: validationReport })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Validate specific department chain
router.get("/department/:departmentId", async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId)
    if (!department) {
      return res.status(404).json({ success: false, error: "Department not found" })
    }

    const blockchain = BlockchainService.reconstructBlockchain(
      department.blockchain.chain,
      `Department-${req.params.departmentId}`,
    )

    const isValid = blockchain.isChainValid()

    res.json({
      success: true,
      data: {
        departmentId: req.params.departmentId,
        departmentName: department.name,
        valid: isValid,
        blockCount: blockchain.chain.length,
        chain: blockchain.getChainData(),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Validate specific class chain
router.get("/class/:classId", async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.classId).populate("departmentId")
    if (!classDoc) {
      return res.status(404).json({ success: false, error: "Class not found" })
    }

    const blockchain = BlockchainService.reconstructBlockchain(classDoc.blockchain.chain, `Class-${req.params.classId}`)

    const isValid = blockchain.isChainValid()

    // Also verify parent department chain
    const deptBlockchain = BlockchainService.reconstructBlockchain(
      classDoc.departmentId.blockchain.chain,
      `Department-${classDoc.departmentId._id}`,
    )

    const parentHashValid = classDoc.blockchain.chain[0]?.prev_hash === deptBlockchain.getLatestBlock().hash

    res.json({
      success: true,
      data: {
        classId: req.params.classId,
        className: classDoc.name,
        departmentId: classDoc.departmentId._id,
        valid: isValid,
        parentChainValid: deptBlockchain.isChainValid(),
        parentHashMatches: parentHashValid,
        blockCount: blockchain.chain.length,
        chain: blockchain.getChainData(),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Validate specific student chain
router.get("/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate("classId").populate("departmentId")

    if (!student) {
      return res.status(404).json({ success: false, error: "Student not found" })
    }

    const blockchain = BlockchainService.reconstructBlockchain(
      student.blockchain.chain,
      `Student-${req.params.studentId}`,
    )

    const isValid = blockchain.isChainValid()

    // Verify parent class chain
    const classBlockchain = BlockchainService.reconstructBlockchain(
      student.classId.blockchain.chain,
      `Class-${student.classId._id}`,
    )

    const parentHashValid = student.blockchain.chain[0]?.prev_hash === classBlockchain.getLatestBlock().hash

    res.json({
      success: true,
      data: {
        studentId: req.params.studentId,
        studentName: student.name,
        rollNumber: student.rollNumber,
        classId: student.classId._id,
        departmentId: student.departmentId._id,
        valid: isValid,
        parentChainValid: classBlockchain.isChainValid(),
        parentHashMatches: parentHashValid,
        blockCount: blockchain.chain.length,
        attendanceBlocks: blockchain.chain.filter((b) => b.transactions.type === "attendance").length,
        chain: blockchain.getChainData(),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Check if entire hierarchical structure is valid
router.get("/hierarchy/:departmentId", async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId)
    if (!department) {
      return res.status(404).json({ success: false, error: "Department not found" })
    }

    const hierarchyReport = {
      departmentId: req.params.departmentId,
      departmentName: department.name,
      valid: true,
      issues: [],
      classes: [],
    }

    const deptBlockchain = BlockchainService.reconstructBlockchain(
      department.blockchain.chain,
      `Department-${req.params.departmentId}`,
    )

    const deptValid = deptBlockchain.isChainValid()
    if (!deptValid) {
      hierarchyReport.valid = false
      hierarchyReport.issues.push("Department chain is invalid")
    }

    const classes = await Class.find({ departmentId: req.params.departmentId })

    for (const classDoc of classes) {
      const classBlockchain = BlockchainService.reconstructBlockchain(
        classDoc.blockchain.chain,
        `Class-${classDoc._id}`,
      )

      const classValid = classBlockchain.isChainValid()
      const parentHashValid = classDoc.blockchain.chain[0]?.prev_hash === deptBlockchain.getLatestBlock().hash

      const classReport = {
        classId: classDoc._id,
        className: classDoc.name,
        valid: classValid && parentHashValid,
        students: [],
      }

      if (!classValid || !parentHashValid) {
        hierarchyReport.valid = false
        classReport.issues = []
        if (!classValid) classReport.issues.push("Class chain is invalid")
        if (!parentHashValid) classReport.issues.push("Parent hash mismatch")
      }

      const students = await Student.find({ classId: classDoc._id })

      for (const student of students) {
        const studentBlockchain = BlockchainService.reconstructBlockchain(
          student.blockchain.chain,
          `Student-${student._id}`,
        )

        const studentValid = studentBlockchain.isChainValid()
        const studentParentHashValid = student.blockchain.chain[0]?.prev_hash === classBlockchain.getLatestBlock().hash

        const studentReport = {
          studentId: student._id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          valid: studentValid && studentParentHashValid,
          attendanceBlocks: studentBlockchain.chain.filter((b) => b.transactions.type === "attendance").length,
        }

        if (!studentValid || !studentParentHashValid) {
          hierarchyReport.valid = false
          studentReport.issues = []
          if (!studentValid) studentReport.issues.push("Student chain is invalid")
          if (!studentParentHashValid) studentReport.issues.push("Parent hash mismatch")
        }

        classReport.students.push(studentReport)
      }

      hierarchyReport.classes.push(classReport)
    }

    res.json({ success: true, data: hierarchyReport })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
