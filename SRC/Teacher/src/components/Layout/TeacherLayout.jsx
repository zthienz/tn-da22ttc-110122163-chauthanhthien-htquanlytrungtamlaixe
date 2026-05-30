import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import './TeacherLayout.css'

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`teacher-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="teacher-main">
        <main className="teacher-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TeacherLayout
