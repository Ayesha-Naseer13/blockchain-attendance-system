# Blockchain-Based Attendance Management System (BAMS)

A comprehensive multi-layered blockchain implementation for managing student attendance with three hierarchical blockchain chains.

## Project Structure


## Features

### Three-Layer Blockchain Architecture
- **Layer 1**: Department Blockchain - Independent chain for each department
- **Layer 2**: Class Blockchain - Child chains linked to department chains via parent hash
- **Layer 3**: Student Blockchain - Personal ledgers linked to class chains

### Blockchain Properties
- SHA-256 hashing for all blocks
- Proof of Work (PoW) with 4-leading-zero difficulty
- Immutable records (append-only design)
- Complete validation system
- Parent-child chain linkage

### Core Functionality
- ✅ CRUD operations for Departments, Classes, and Students
- ✅ Real-time attendance tracking
- ✅ Multi-level chain validation
- ✅ Attendance history with blockchain records
- ✅ Hierarchical blockchain structure verification

## Setup Instructions

### Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

Configure `.env`:
\`\`\`
MONGODB_URI=mongodb://localhost:27017/bams
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
\`\`\`

Start the backend:
\`\`\`bash
npm start
# or for development with auto-reload
npm run dev
\`\`\`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

The frontend will run on `http://localhost:3000`

## API Endpoints

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department
- `GET /api/departments/:id` - Get department details
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department
- `GET /api/departments/search/:name` - Search department

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/department/:departmentId` - Get classes by department
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/search/:name` - Search class

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `GET /api/students/class/:classId` - Get students by class
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/search/:query` - Search student

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/date/:date` - Get attendance for date
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/department/:departmentId` - Get department attendance
- `GET /api/attendance/student/:studentId` - Get student attendance history

### Validation
- `GET /api/validation/all` - Validate all chains
- `GET /api/validation/department/:departmentId` - Validate department chain
- `GET /api/validation/class/:classId` - Validate class chain
- `GET /api/validation/student/:studentId` - Validate student chain
- `GET /api/validation/hierarchy/:departmentId` - Validate department hierarchy

## Blockchain Implementation Details

### Block Structure
\`\`\`javascript
{
  index: number,
  timestamp: string (ISO 8601),
  transactions: object,
  prev_hash: string (SHA-256),
  nonce: number,
  hash: string (SHA-256)
}
\`\`\`

### Hashing
SHA-256 hash computed from:
- Block index
- Timestamp
- Transaction payload
- Previous block hash
- Nonce value

### Proof of Work
- Difficulty: 4 leading zeros required
- Algorithm: Iterate nonce until hash meets difficulty requirement
- Timing: ~1-2 seconds per block depending on system

## Example Usage

### 1. Create a Department
\`\`\`bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "School of Computing",
    "code": "CSE",
    "description": "Computer Science Department"
  }'
\`\`\`

### 2. Create a Class under Department
\`\`\`bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CSE-1A",
    "code": "CSE001",
    "departmentId": "DEPT_ID_HERE"
  }'
\`\`\`

### 3. Add Student
\`\`\`bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "rollNumber": "001",
    "email": "john@example.com",
    "departmentId": "DEPT_ID",
    "classId": "CLASS_ID"
  }'
\`\`\`

### 4. Mark Attendance
\`\`\`bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STUDENT_ID",
    "status": "Present",
    "date": "2025-12-01"
  }'
\`\`\`

### 5. Validate Chains
\`\`\`bash
curl http://localhost:5000/api/validation/all
\`\`\`

## Features Explained

### Immutability
All updates and deletions create new blocks instead of modifying existing ones:
- Department update → New block with updated_fields + status: "updated"
- Student deletion → New block with status: "deleted"
- Previous blocks remain intact and cannot be modified

### Multi-Level Validation
The validation system checks:
1. Department chain integrity
2. Class chain integrity and parent hash
3. Student chain integrity and parent hash
4. All blocks have valid PoW
5. Hash chain linkage is correct

### Hierarchical Linkage
- Class genesis block prev_hash = Department's latest block hash
- Student genesis block prev_hash = Class's latest block hash
- Attendance blocks append to student's chain

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React 18, React Router, Axios
- **Blockchain**: Custom implementation with SHA-256 & PoW
- **Database**: MongoDB (Local or Atlas)

## Performance Notes

- PoW mining adds ~1-2 seconds per block
- Blockchain validation is O(n) for n blocks
- Best practice: Run multiple instances for production
- Monitor MongoDB connection pooling

## Future Enhancements

- JWT authentication for admin
- Role-based access control
- Export attendance reports
- Real-time notifications
- Batch attendance import
- Analytics dashboard
- API rate limiting
- Caching for validation

## License

MIT License - Free to use and modify

## Support

For issues or questions, refer to API documentation or create an issue in the repository.
#
