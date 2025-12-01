"use client"

import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Validation = () => {
  const [validationReport, setValidationReport] = useState(null)
  const [studentHistory, setStudentHistory] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedDepts, setExpandedDepts] = useState({})
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students")
      setStudents(response.data.data)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch students",
      })
    }
  }

  const validateAllChains = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/validation/all")
      setValidationReport(response.data.data)
      setAlert({
        type: "success",
        message: "Chain validation completed",
      })
    } catch (error) {
      setAlert({
        type: "error",
        message: "Validation failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const viewStudentHistory = async (studentId) => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/attendance/student/${studentId}`)
      setStudentHistory(response.data)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch student history",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleDeptExpansion = (deptId) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Blockchain Validation</h1>
          <p>Validate entire blockchain structure and view attendance history</p>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={validateAllChains}
          disabled={loading}
          style={{ height: "fit-content", justifyContent: "center" }}
        >
          <RefreshCw size={18} />
          {loading ? "Validating..." : "Validate All Chains"}
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="">Select student for history</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.rollNumber})
              </option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => selectedStudentId && viewStudentHistory(selectedStudentId)}
            disabled={!selectedStudentId || loading}
          >
            View History
          </button>
        </div>
      </div>

      {validationReport && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            {validationReport.valid ? (
              <CheckCircle size={24} color="#22c55e" />
            ) : (
              <AlertCircle size={24} color="#ef4444" />
            )}
            Overall Status: {validationReport.valid ? "VALID" : "INVALID"}
          </h2>

          {validationReport.issues && validationReport.issues.length > 0 && (
            <div
              style={{
                background: "#fee2e2",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                borderLeft: "4px solid #ef4444",
              }}
            >
              <strong>Issues Found:</strong>
              <ul style={{ margin: "5px 0 0 20px", color: "#991b1b" }}>
                {validationReport.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            {validationReport.departments &&
              validationReport.departments.map((dept) => (
                <div
                  key={dept.departmentId}
                  style={{ background: "#f7fafc", padding: "15px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                >
                  <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    {dept.valid ? <CheckCircle size={16} color="#22c55e" /> : <AlertCircle size={16} color="#ef4444" />}
                    {dept.name}
                  </h4>
                  <p style={{ margin: "0", fontSize: "13px", color: "#718096" }}>
                    Blocks: {dept.blocks} | Status: {dept.valid ? "Valid" : "Invalid"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {studentHistory && (
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2>{studentHistory.student.name} - Attendance History</h2>
          <p style={{ color: "#718096", marginBottom: "15px" }}>Roll: {studentHistory.student.rollNumber}</p>

          <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
            Blockchain Records ({studentHistory.blockchainHistory.length})
          </h3>
          <div className="table-responsive">
            <table className="table" style={{ marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th>Block Index</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Hash (First 16 chars)</th>
                </tr>
              </thead>
              <tbody>
                {studentHistory.blockchainHistory.map((block, idx) => (
                  <tr key={idx}>
                    <td>{block.blockIndex}</td>
                    <td>
                      <span
                        className={`badge badge-${block.status === "Present" ? "success" : block.status === "Absent" ? "danger" : "warning"}`}
                      >
                        {block.status}
                      </span>
                    </td>
                    <td>{new Date(block.timestamp).toLocaleString()}</td>
                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{block.hash.substring(0, 16)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Validation
