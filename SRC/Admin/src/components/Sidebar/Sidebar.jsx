import { NavLink } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import './Sidebar.css'

// Menu cho ADMIN
const adminMenu = [
  { path: '/',           icon: '📊', label: 'Dashboard',       end: true },
  { path: '/ho-so',      icon: '📋', label: 'Hồ Sơ Học Viên' },
  { path: '/khoa-hoc',   icon: '📚', label: 'Khóa Học' },
  { path: '/lop-hoc',    icon: '🏫', label: 'Lớp Học' },
  { path: '/lich-hoc',   icon: '📅', label: 'Lịch Học' },
  { path: '/thi',        icon: '🏆', label: 'Thi & Kết Quả' },
  { path: '/giang-vien', icon: '👨‍🏫', label: 'Giảng Viên' },
  { path: '/xe',         icon: '🚗', label: 'Quản Lý Xe' },
]

// Menu cho GIẢNG VIÊN
const giangVienMenu = [
  { path: '/',                    icon: '📊', label: 'Tổng Quan',         end: true },
  { path: '/thong-tin-ca-nhan',   icon: '👤', label: 'Thông Tin Cá Nhân' },
  { path: '/lop-cua-toi',         icon: '🏫', label: 'Lớp Của Tôi' },
  { path: '/diem-danh',           icon: '✅', label: 'Điểm Danh & Km' },
  { path: '/xe-cua-toi',          icon: '🚗', label: 'Xe Của Tôi' },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const { adminInfo, isAdmin, isGiangVien, logout } = useAdmin()
  const menu = isAdmin ? adminMenu : giangVienMenu

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        {collapsed ? (
          <div className="sidebar-logo-icon">⭐</div>
        ) : (
          <div className="sidebar-logo-brand">
            <div className="sidebar-logo-star">⭐</div>
            <div className="sidebar-logo-text">
              <span className="slt-top">TRUNG TÂM LÁI XE</span>
              <span className="slt-bottom">SAO VIỆT</span>
              <span className="slt-line" />
            </div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="sidebar-role">
          <div className="sidebar-avatar">
            {adminInfo?.ho_ten?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{adminInfo?.ho_ten || 'Admin'}</p>
            <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-info'}`}>
              {isAdmin ? '👑 Quản Trị Viên' : '👨‍🏫 Giảng Viên'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <p className="sidebar-section-label">
            {isAdmin ? 'QUẢN TRỊ' : 'GIẢNG VIÊN'}
          </p>
        )}
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={logout} title="Đăng xuất">
        <span>🚪</span>
        {!collapsed && <span>Đăng Xuất</span>}
      </button>
    </aside>
  )
}

export default Sidebar
