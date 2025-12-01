"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, Building2, TrendingUp } from "lucide-react"
import axios from "axios"
import "./Pages.css"

const Dashboard = () => {
  const [stats, setStats] = useState({
    departments: 0,
    classes: 0,
    students: 0,
    totalAttendance: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [deptRes, classRes, studentRes] = await Promise.all([
        axios.get("${process.env.REACT_APP_API_URL}/api/departments"),
        axios.get("${process.env.REACT_APP_API_URL}/api/classes"),
        axios.get("${process.env.REACT_APP_API_URL}/api/students"),
      ])

      setStats({
        departments: deptRes.data.data.length,
        classes: classRes.data.data.length,
        students: studentRes.data.data.length,
        totalAttendance: 0, // Will be calculated from attendance records
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <Icon size={28} />
      </div>
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to Blockchain Attendance Management System</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={Building2} label="Departments" value={stats.departments} color="blue" />
        <StatCard icon={BookOpen} label="Classes" value={stats.classes} color="green" />
        <StatCard icon={Users} label="Students" value={stats.students} color="purple" />
        <StatCard icon={TrendingUp} label="Total Attendance" value={stats.totalAttendance} color="orange" />
      </div>

      <div className="info-section">
        <div className="info-card">
          <h2>System Overview</h2>
          <p>This is a multi-layered blockchain-based attendance management system with three hierarchical chains:</p>
          <ul>
            <li>
              <strong>Layer 1:</strong> Department Blockchain - Independent chain for each department
            </li>
            <li>
              <strong>Layer 2:</strong> Class Blockchain - Child chains linked to department chains
            </li>
            <li>
              <strong>Layer 3:</strong> Student Blockchain - Personal ledgers linked to class chains
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h2>Key Features</h2>
          <ul>
            <li>SHA-256 hashing with Proof of Work (PoW)</li>
            <li>Immutable attendance records</li>
            <li>Multi-level chain validation</li>
            <li>Hierarchical blockchain structure</li>
            <li>Real-time attendance tracking</li>
            <li>Complete audit trail</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
