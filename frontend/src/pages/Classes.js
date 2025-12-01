"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Classes = () => {
  const [classes, setClasses] = useState([])
  const [filteredClasses, setFilteredClasses] = useState([])
  const [departments, setDepartments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    departmentId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterClasses()
  }, [searchTerm, selectedDept, classes])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [deptRes, classRes] = await Promise.all([
        axios.get("http://localhost:5000/api/departments"),
        axios.get("http://localhost:5000/api/classes"),
      ])
      setDepartments(deptRes.data.data)
      setClasses(classRes.data.data)
      if (deptRes.data.data.length > 0) {
        setSelectedDept(deptRes.data.data[0]._id)
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

  const filterClasses = () => {
    let filtered = classes

    if (selectedDept) {
      filtered = filtered.filter((c) => c.departmentId._id === selectedDept)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredClasses(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/classes/${editingId}`, formData)
        setAlert({
          type: "success",
          message: "Class updated successfully",
        })
      } else {
        await axios.post("http://localhost:5000/api/classes", formData)
        setAlert({
          type: "success",
          message: "Class created successfully",
        })
      }

      setFormData({ name: "", code: "", departmentId: "" })
      setEditingId(null)
      setShowModal(false)
      fetchData()
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Error saving class",
      })
    }
  }

  const handleEdit = (cls) => {
    setFormData({
      name: cls.name,
      code: cls.code,
      departmentId: cls.departmentId._id,
    })
    setEditingId(cls._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`)
        setAlert({
          type: "success",
          message: "Class deleted successfully",
        })
        fetchData()
      } catch (error) {
        setAlert({
          type: "error",
          message: "Error deleting class",
        })
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({ name: "", code: "", departmentId: "" })
    setEditingId(null)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Classes</h1>
            <p>Manage classes within departments</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Class
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
            placeholder="Search classes..."
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
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #cbd5e0",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading classes...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Code</th>
                <th>Department</th>
                <th>Blocks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <tr key={cls._id}>
                  <td className="font-weight-600">{cls.name}</td>
                  <td>{cls.code}</td>
                  <td>{cls.departmentId.name}</td>
                  <td>{cls.blockchain?.chain?.length || 0}</td>
                  <td>
                    <span className={`badge badge-${cls.status === "active" ? "success" : "danger"}`}>
                      {cls.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {cls.status === "active" && (
                        <>
                          <button className="btn btn-small btn-secondary" onClick={() => handleEdit(cls)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(cls._id)}>
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
              <h2>{editingId ? "Edit Class" : "Add Class"}</h2>
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
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
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
                  <label>Class Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., CSE-1A"
                  />
                </div>
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CSE001"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Create"} Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Classes
