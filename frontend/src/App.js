"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Departments from "./pages/Departments"
import Classes from "./pages/Classes"
import Students from "./pages/Students"
import Attendance from "./pages/Attendance"
import Validation from "./pages/Validation"
import "./App.css"

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [apiStatus, setApiStatus] = useState("checking")

  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch("${process.env.REACT_APP_API_URL}/api/health")
      if (response.ok) {
        setApiStatus("connected")
      } else {
        setApiStatus("error")
      }
    } catch (error) {
      setApiStatus("error")
    }
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`main-content ${isSidebarOpen ? "open" : "closed"}`}>
          <div className="api-status">
            <span className={`status-indicator ${apiStatus}`}></span>
            {apiStatus === "connected" ? "Backend Connected" : "Backend Connecting..."}
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/validation" element={<Validation />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App