"use client"
import { Link } from "react-router-dom"
import { Menu, X, Home, Building2, BookOpen, Users, ClipboardList, CheckCircle2 } from "lucide-react"
import "./Sidebar.css"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/departments", icon: Building2, label: "Departments" },
    { path: "/classes", icon: BookOpen, label: "Classes" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/attendance", icon: ClipboardList, label: "Attendance" },
    { path: "/validation", icon: CheckCircle2, label: "Validation" },
  ]

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h1>BAMS</h1>
          <p>Blockchain Attendance</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-item" title={item.label}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
