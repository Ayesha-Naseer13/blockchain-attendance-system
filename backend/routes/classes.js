import express from "express"
import Class from "../models/Class.js"
import { BlockchainService } from "../services/blockchainService.js"

const router = express.Router()

// Create class
router.post("/", async (req, res) => {
  try {
    const { name, code, departmentId } = req.body

    const newClass = new Class({
      name,
      code,
      departmentId,
      blockchain: { chain: [] },
    })

    await newClass.save()

    // Create blockchain for class (child of department)
    await BlockchainService.createClassBlockchain(
      newClass._id,
      {
        name,
        code,
      },
      departmentId,
    )

    const classDoc = await Class.findById(newClass._id).populate("departmentId")
    res.status(201).json({ success: true, data: classDoc })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find({ status: "active" }).populate("departmentId")
    res.json({ success: true, data: classes })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get classes by department
router.get("/department/:departmentId", async (req, res) => {
  try {
    const classes = await Class.find({
      departmentId: req.params.departmentId,
      status: "active",
    }).populate("departmentId")
    res.json({ success: true, data: classes })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Search class by name
router.get("/search/:name", async (req, res) => {
  try {
    const classes = await Class.find({
      name: { $regex: req.params.name, $options: "i" },
      status: "active",
    }).populate("departmentId")
    res.json({ success: true, data: classes })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update class
router.put("/:id", async (req, res) => {
  try {
    const { name, code } = req.body

    await BlockchainService.addUpdateBlock(req.params.id, "Class", {
      name,
      code,
      status: "updated",
    })

    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      { name, code, updatedAt: new Date() },
      { new: true },
    ).populate("departmentId")

    res.json({ success: true, data: classDoc })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// Delete class
router.delete("/:id", async (req, res) => {
  try {
    await BlockchainService.addUpdateBlock(req.params.id, "Class", {
      status: "deleted",
    })

    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      { status: "deleted", updatedAt: new Date() },
      { new: true },
    ).populate("departmentId")

    res.json({ success: true, data: classDoc, message: "Class marked as deleted" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

export default router
