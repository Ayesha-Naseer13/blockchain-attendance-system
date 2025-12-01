import express from "express"
import Department from "../models/Department.js"
import { BlockchainService } from "../services/blockchainService.js"

const router = express.Router()

// Create department
router.post("/", async (req, res) => {
  try {
    const { name, code, description } = req.body

    const newDept = new Department({
      name,
      code,
      description,
      blockchain: { chain: [] },
    })

    await newDept.save()

    // Create blockchain for department
    await BlockchainService.createDepartmentBlockchain(newDept._id, {
      name,
      code,
      description,
    })

    const dept = await Department.findById(newDept._id)
    res.status(201).json({ success: true, data: dept })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Get all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({ status: "active" })
    res.json({ success: true, data: departments })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get department by ID
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
    res.json({ success: true, data: department })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Search department by name
router.get("/search/:name", async (req, res) => {
  try {
    const departments = await Department.find({
      name: { $regex: req.params.name, $options: "i" },
      status: "active",
    })
    res.json({ success: true, data: departments })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update department (adds new block instead of modifying)
router.put("/:id", async (req, res) => {
  try {
    const { name, code, description } = req.body

    await BlockchainService.addUpdateBlock(req.params.id, "Department", {
      name,
      code,
      description,
      status: "updated",
    })

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, updatedAt: new Date() },
      { new: true },
    )

    res.json({ success: true, data: dept })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Delete department (soft delete - adds status:deleted block)
router.delete("/:id", async (req, res) => {
  try {
    await BlockchainService.addUpdateBlock(req.params.id, "Department", {
      status: "deleted",
    })

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { status: "deleted", updatedAt: new Date() },
      { new: true },
    )

    res.json({ success: true, data: dept, message: "Department marked as deleted" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
