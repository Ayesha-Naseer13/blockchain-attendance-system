"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Attendance = () => {
  const [attendance, setAttendance] = useState([])
  const [filteredAttendance, setFilteredAttendance] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    studentId: "",
    status: "Present",
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAttendance()
  }, [selectedClass, selectedDate, attendance])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [classRes, studentRes] = await Promise.all([
        axios.get("${process.env.REACT_APP_API_URL}/api/classes"),
        axios.get("${process.env.REACT_APP_API_URL}/api/students"),
      ])
      setClasses(classRes.data.data)
      setStudents(studentRes.data.data)
      if (classRes.data.data.length > 0) {
        setSelectedClass(classRes.data.data[0]._id)
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch data",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAttendance = async () => {
    try {
      if (!selectedClass) return

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/attendance/class/${selectedClass}`)

      const filtered = response.data.data.filter((record) => {
        const recordDate = new Date(record.date).toISOString().split("T")[0]
        return recordDate === selectedDate
      })

      setFilteredAttendance(filtered)
    } catch (error) {
      console.error("Error filtering attendance:", error)
    }
  }

  const getStudentsByClass = (classId) => {
    return students.filter((s) => s.classId._id === classId && s.status === "active")
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()

    try {
      await axios.post("${process.env.REACT_APP_API_URL}/api/attendance", {
        ...formData,
        date: selectedDate,
      })

      setAlert({
        type: "success",
        message: "Attendance marked successfully",
      })

      setFormData({ studentId: "", status: "Present" })
      setShowModal(false)
      filterAttendance()
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Error marking attendance",
      })
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Attendance</h1>
            <p>Mark and manage student attendance</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Mark Attendance
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px" }}>Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.departmentId.name} - {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px" }}>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading attendance...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Status</th>
                <th>Block Hash</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record._id}>
                    <td className="font-weight-600">{record.studentId.name}</td>
                    <td>{record.studentId.rollNumber}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          record.status === "Present" ? "success" : record.status === "Absent" ? "danger" : "warning"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {record.blockData?.hash?.substring(0, 16)}...
                    </td>
                    <td>{new Date(record.blockData?.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#718096" }}>
                    No attendance records for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mark Attendance</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleMarkAttendance}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Student *</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  >
                    <option value="">Select a student</option>
                    {getStudentsByClass(selectedClass).map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance
