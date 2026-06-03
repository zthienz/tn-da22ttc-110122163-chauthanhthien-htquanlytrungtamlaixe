import { NavLink } from 'react-router-dom'
import { useTeacher } from '../../context/TeacherContext'
import './Sidebar.css'

const menu = [
  { path: '/',          icon: '📊', label: 'Tổng Quan',         end: true },
  { path: '/thong-tin', icon: '👤', label: 'Thông Tin Cá Nhân' },
  { path: '/lop-hoc',   icon: '🏫', label: 'Lớp Của Tôi' },
  { path: '/lich-hoc',  icon: '🗓️', label: 'Lịch Dạy' },
  { path: '/xe',        icon: '🚗', label: 'Xe Của Tôi' },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const { teacherInfo, logout } = useTeacher()

  return (
    <aside className={`tv-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo + toggle */}
      <div className="tv-sidebar-logo">
        {collapsed ? (
          <button className="tv-toggle-btn" onClick={onToggle} title="Mở rộng">⭐</button>
        ) : (
          <div className="tv-logo-brand">
            <div className="tv-logo-star">⭐</div>
            <div className="tv-logo-text">
              <span className="tv-logo-sub">TRUNG TÂM LÁI XE</span>
              <span className="tv-logo-name">SAO VIỆT</span>
            </div>
            <button className="tv-toggle-btn" onClick={onToggle} title="Thu gọn">◀</button>
          </div>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="tv-user-info">
          <div className="tv-avatar">
            {teacherInfo?.anh_dai_dien
              ? <img src={`/uploads/${teacherInfo.anh_dai_dien}`} alt={teacherInfo.ho_ten}
                  style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}
                  onError={e => { e.target.style.display='none' }} />
              : teacherInfo?.ho_ten?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div>
            <p className="tv-user-name">{teacherInfo?.ho_ten || 'Giảng Viên'}</p>
            <span className="badge badge-success" style={{ fontSize: 11 }}>
              👨‍🏫 Giảng Viên
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="tv-nav">
        {!collapsed && <p className="tv-nav-label">GIẢNG VIÊN</p>}
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `tv-nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="tv-nav-icon">{item.icon}</span>
            {!collapsed && <span className="tv-nav-label-item">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="tv-logout" onClick={() => logout()} title="Đăng xuất">
        <span>🚪</span>
        {!collapsed && <span>Đăng Xuất</span>}
      </button>
    </aside>
  )
}

export default Sidebar
