import { Blockchain, Block } from "../utils/blockchain.js"
import Department from "../models/Department.js"
import Class from "../models/Class.js"
import Student from "../models/Student.js"

export class BlockchainService {
  // Convert stored chain array back to Blockchain instance
  static reconstructBlockchain(chainArray, chainName) {
    const blockchain = new Blockchain(chainName, "0")
    blockchain.chain = []

    chainArray.forEach((blockData, index) => {
      const block = new Block(
        blockData.index,
        blockData.timestamp,
        blockData.transactions,
        blockData.prev_hash,
        blockData.nonce,
        blockData.hash,
      )
      blockchain.chain.push(block)
    })

    return blockchain
  }

  // Create department blockchain
  static async createDepartmentBlockchain(departmentId, departmentData) {
    const blockchain = new Blockchain(`Department-${departmentId}`)

    const genesisTransaction = {
      type: "department_genesis",
      department: departmentData,
    }

    const genesisBlock = blockchain.chain[0]
    genesisBlock.transactions = genesisTransaction
    genesisBlock.hash = genesisBlock.calculateHash()
    blockchain.chain[0].mineBlock(blockchain.difficulty)

    await Department.findByIdAndUpdate(departmentId, {
      blockchain: { chain: blockchain.getChainData() },
    })

    return blockchain
  }

  // Create class blockchain (child of department)
  static async createClassBlockchain(classId, classData, departmentId) {
    const department = await Department.findById(departmentId)
    const departmentBlockchain = this.reconstructBlockchain(department.blockchain.chain, `Department-${departmentId}`)
    const parentHash = departmentBlockchain.getLatestBlock().hash

    const blockchain = new Blockchain(`Class-${classId}`, parentHash)
    blockchain.genesisBlock.prev_hash = parentHash
    blockchain.genesisBlock.transactions = {
      type: "class_genesis",
      class: classData,
      parent_chain: `Department-${departmentId}`,
    }
    blockchain.genesisBlock.hash = blockchain.genesisBlock.calculateHash()
    blockchain.genesisBlock.mineBlock(blockchain.difficulty)

    await Class.findByIdAndUpdate(classId, {
      blockchain: { chain: blockchain.getChainData() },
    })

    return blockchain
  }

  // Create student blockchain (child of class)
  static async createStudentBlockchain(studentId, studentData, classId, departmentId) {
    const classDoc = await Class.findById(classId)
    const classBlockchain = this.reconstructBlockchain(classDoc.blockchain.chain, `Class-${classId}`)
    const parentHash = classBlockchain.getLatestBlock().hash

    const blockchain = new Blockchain(`Student-${studentId}`, parentHash)
    blockchain.genesisBlock.prev_hash = parentHash
    blockchain.genesisBlock.transactions = {
      type: "student_genesis",
      student: studentData,
      parent_chain: `Class-${classId}`,
    }
    blockchain.genesisBlock.hash = blockchain.genesisBlock.calculateHash()
    blockchain.genesisBlock.mineBlock(blockchain.difficulty)

    await Student.findByIdAndUpdate(studentId, {
      blockchain: { chain: blockchain.getChainData() },
    })

    return blockchain
  }

  // Add attendance block to student chain
  static async addAttendanceBlock(studentId, attendanceData) {
    const student = await Student.findById(studentId)
    const studentBlockchain = this.reconstructBlockchain(student.blockchain.chain, `Student-${studentId}`)

    const newBlock = studentBlockchain.addBlock({
      type: "attendance",
      attendance: attendanceData,
    })

    await Student.findByIdAndUpdate(studentId, {
      blockchain: { chain: studentBlockchain.getChainData() },
    })

    return newBlock
  }

  // Add update/deletion block to any chain
  static async addUpdateBlock(documentId, documentType, updateData) {
    const Model = this.getModel(documentType)
    const doc = await Model.findById(documentId)
    const blockchain = this.reconstructBlockchain(doc.blockchain.chain, `${documentType}-${documentId}`)

    const newBlock = blockchain.addBlock({
      type: documentType === "Student" ? "student_update" : `${documentType.toLowerCase()}_update`,
      data: updateData,
    })

    await Model.findByIdAndUpdate(documentId, {
      blockchain: { chain: blockchain.getChainData() },
    })

    return newBlock
  }

  // Get model based on type
  static getModel(documentType) {
    const models = {
      Department,
      Class,
      Student,
    }
    return models[documentType]
  }

  // Validate all chains (multi-level validation)
  static async validateAllChains() {
    const validationReport = {
      valid: true,
      departments: [],
      issues: [],
    }

    const departments = await Department.find()

    for (const dept of departments) {
      const deptBlockchain = this.reconstructBlockchain(dept.blockchain.chain, `Department-${dept._id}`)

      const deptValid = deptBlockchain.isChainValid()
      validationReport.departments.push({
        departmentId: dept._id,
        name: dept.name,
        valid: deptValid,
        blocks: deptBlockchain.chain.length,
      })

      if (!deptValid) {
        validationReport.valid = false
        validationReport.issues.push(`Department ${dept.name} chain is invalid`)
      }

      // Validate child class chains
      const classes = await Class.find({ departmentId: dept._id })
      for (const classDoc of classes) {
        const classBlockchain = this.reconstructBlockchain(classDoc.blockchain.chain, `Class-${classDoc._id}`)

        const classValid = classBlockchain.isChainValid()
        if (!classValid) {
          validationReport.valid = false
          validationReport.issues.push(`Class ${classDoc.name} chain is invalid`)
        }

        // Validate child student chains
        const students = await Student.find({ classId: classDoc._id })
        for (const student of students) {
          const studentBlockchain = this.reconstructBlockchain(student.blockchain.chain, `Student-${student._id}`)

          const studentValid = studentBlockchain.isChainValid()
          if (!studentValid) {
            validationReport.valid = false
            validationReport.issues.push(`Student ${student.name} chain is invalid`)
          }
        }
      }
    }

    return validationReport
  }
}
