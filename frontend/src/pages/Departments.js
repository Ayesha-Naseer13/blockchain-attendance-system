"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [filteredDepts, setFilteredDepts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDepts(filtered)
  }, [searchTerm, departments])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await axios.get("${process.env.REACT_APP_API_URL}/api/departments")
      setDepartments(response.data.data)
      setAlert(null)
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to fetch departments",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/departments/${editingId}`, formData)
        setAlert({
          type: "success",
          message: "Department updated successfully",
        })
      } else {
        await axios.post("${process.env.REACT_APP_API_URL}/api/departments", formData)
        setAlert({
          type: "success",
          message: "Department created successfully",
        })
      }

      setFormData({ name: "", code: "", description: "" })
      setEditingId(null)
      setShowModal(false)
      fetchDepartments()
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Error saving department",
      })
    }
  }

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
    })
    setEditingId(dept._id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/departments/${id}`)
        setAlert({
          type: "success",
          message: "Department deleted successfully",
        })
        fetchDepartments()
      } catch (error) {
        setAlert({
          type: "error",
          message: "Error deleting department",
        })
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({ name: "", code: "", description: "" })
    setEditingId(null)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Departments</h1>
            <p>Manage all departments and their blockchains</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <Search size={18} />
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading departments...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Blocks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((dept) => (
                <tr key={dept._id}>
                  <td className="font-weight-600">{dept.name}</td>
                  <td>{dept.code}</td>
                  <td>{dept.description || "-"}</td>
                  <td>{dept.blockchain?.chain?.length || 0}</td>
                  <td>
                    <span className={`badge badge-${dept.status === "active" ? "success" : "danger"}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {dept.status === "active" && (
                        <>
                          <button className="btn btn-small btn-secondary" onClick={() => handleEdit(dept)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(dept._id)}>
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
              <h2>{editingId ? "Edit Department" : "Add Department"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., School of Computing"
                  />
                </div>
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CSE"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter department description"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Create"} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments
