"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Students = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [departments, setDepartments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    departmentId: "",
    classId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, selectedClass, students])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [deptRes, classRes, studentRes] = await Promise.all([
        axios.get("${process.env.REACT_APP_API_URL}/api/departments"),
        axios.get("${process.env.REACT_APP_API_URL}/api/classes"),
        axios.get("${process.env.REACT_APP_API_URL}/api/students"),
      ])
      setDepartments(deptRes.data.data)
      setClasses(classRes.data.data)
      setStudents(studentRes.data.data)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch data",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (selectedClass) {
      filtered = filtered.filter((s) => s.classId._id === selectedClass)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredStudents(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/students/${editingId}`, formData)
        setAlert({
          type: "success",
          message: "Student updated successfully",
        })
      } else {
        await axios.post("${process.env.REACT_APP_API_URL}/api/students", formData)
        setAlert({
          type: "success",
          message: "Student created successfully",
        })
      }

      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        departmentId: "",
        classId: "",
      })
      setEditingId(null)
      setShowModal(false)
      fetchData()
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Error saving student",
      })
    }
  }

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      departmentId: student.departmentId._id,
      classId: student.classId._id,
    })
    setEditingId(student._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/students/${id}`)
        setAlert({
          type: "success",
          message: "Student deleted successfully",
        })
        fetchData()
      } catch (error) {
        setAlert({
          type: "error",
          message: "Error deleting student",
        })
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      name: "",
      rollNumber: "",
      email: "",
      departmentId: "",
      classId: "",
    })
    setEditingId(null)
  }

  const getClassesByDept = (deptId) => {
    return classes.filter((c) => c.departmentId._id === deptId)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Students</h1>
            <p>Manage student records and blockchain chains</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Student
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
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #cbd5e0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #cbd5e0",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.departmentId.name} - {cls.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading students...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Email</th>
                <th>Department</th>
                <th>Class</th>
                <th>Blocks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="font-weight-600">{student.name}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.email || "-"}</td>
                  <td>{student.departmentId.name}</td>
                  <td>{student.classId.name}</td>
                  <td>{student.blockchain?.chain?.length || 0}</td>
                  <td>
                    <span className={`badge badge-${student.status === "active" ? "success" : "danger"}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {student.status === "active" && (
                        <>
                          <button className="btn btn-small btn-secondary" onClick={() => handleEdit(student)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(student._id)}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentId: e.target.value,
                        classId: "",
                      })
                    }
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {getClassesByDept(formData.departmentId).map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g., 001"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john@example.com"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Add"} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students
