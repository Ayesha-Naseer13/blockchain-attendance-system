import mongoose from "mongoose";
import Department from "./models/Department.js";
import Class from "./models/Class.js";
import Student from "./models/Student.js";

import { Blockchain } from "./utils/blockchain.js";
import "dotenv/config";

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bams")
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function seedDatabase() {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});

    console.log("Creating departments...");

    // Department 1 - SOC
    const deptBlockchain1 = new Blockchain("department");
    deptBlockchain1.createGenesisBlock([
      { type: "department_creation", name: "School of Computing", code: "SOC" }
    ]);

    const dept1 = await Department.create({
      name: "School of Computing",
      code: "SOC",
      description: "Computer Science and Engineering Programs",
      blockchain: deptBlockchain1.getChainData(),
    });

    // Department 2 - SSE
    const deptBlockchain2 = new Blockchain("department");
    deptBlockchain2.createGenesisBlock([
      { type: "department_creation", name: "School of Software Engineering", code: "SSE" }
    ]);

    const dept2 = await Department.create({
      name: "School of Software Engineering",
      code: "SSE",
      description: "Software Development and Engineering Programs",
      blockchain: deptBlockchain2.getChainData(),
    });

    console.log("Creating classes...");

    // Classes for SOC
    const socClasses = [];
    for (let i = 1; i <= 5; i++) {
      const classBlockchain = new Blockchain("class", deptBlockchain1.getLatestBlock().hash);
      classBlockchain.createGenesisBlock([
        { type: "class_creation", name: `CSE-${i}00`, code: `CSE${i}`, semester: i }
      ]);

      const classDoc = await Class.create({
        name: `CSE-${i}00`,
        code: `CSE${i}`,
        departmentId: dept1._id,
        semester: i,
        blockchain: classBlockchain.getChainData(),
      });

      socClasses.push(classDoc);
    }

    // Classes for SSE
    const sseClasses = [];
    for (let i = 1; i <= 5; i++) {
      const classBlockchain = new Blockchain("class", deptBlockchain2.getLatestBlock().hash);
      classBlockchain.createGenesisBlock([
        { type: "class_creation", name: `SWE-${i}00`, code: `SWE${i}`, semester: i }
      ]);

      const classDoc = await Class.create({
        name: `SWE-${i}00`,
        code: `SWE${i}`,
        departmentId: dept2._id,
        semester: i,
        blockchain: classBlockchain.getChainData(),
      });

      sseClasses.push(classDoc);
    }

    console.log("Creating students...");

    // Students for SOC
   // Students for SOC
for (const cls of socClasses) {
  const classBlockchain = new Blockchain("class");

  // FIX: assign the correct array of blocks
  classBlockchain.chain = cls.blockchain.chain;

  for (let i = 1; i <= 35; i++) {
    const studentBlockchain = new Blockchain(
      "student",
      classBlockchain.getLatestBlock().hash
    );
    studentBlockchain.createGenesisBlock([
      {
        type: "student_creation",
        name: `Student SOC-${cls.semester}-${i}`,
        rollNumber: `SOC${cls.semester}${String(i).padStart(3, "0")}`,
      },
    ]);

    await Student.create({
      name: `Student SOC-${cls.semester}-${i}`,
      rollNumber: `SOC${cls.semester}${String(i).padStart(3, "0")}`,
      email: `soc${cls.semester}${i}@university.edu`,
      departmentId: dept1._id,
      classId: cls._id,
      blockchain: studentBlockchain.getChainData(),
    });
  }
}


    // Students for SSE
    for (const cls of sseClasses) {
      const classBlockchain = new Blockchain("class");
      classBlockchain.chain = cls.blockchain;

      for (let i = 1; i <= 35; i++) {
        const studentBlockchain = new Blockchain("student", classBlockchain.getLatestBlock().hash);
        studentBlockchain.createGenesisBlock([
          {
            type: "student_creation",
            name: `Student SSE-${cls.semester}-${i}`,
            rollNumber: `SSE${cls.semester}${String(i).padStart(3, "0")}`,
          },
        ]);

        await Student.create({
          name: `Student SSE-${cls.semester}-${i}`,
          rollNumber: `SSE${cls.semester}${String(i).padStart(3, "0")}`,
          email: `sse${cls.semester}${i}@university.edu`,
          departmentId: dept2._id,
          classId: cls._id,
          blockchain: studentBlockchain.getChainData(),
        });
      }
    }

    console.log("Seeding completed successfully!");
    console.log(`Created 2 departments, 10 classes, and 700 students`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
