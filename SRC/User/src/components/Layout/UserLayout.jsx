import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import './UserLayout.css'

const menuItems = [
  { path: '/',           icon: '🏠', label: 'Tổng Quan',      end: true },
  { path: '/lich-hoc',   icon: '📅', label: 'Lịch Học' },
  { path: '/tien-do',    icon: '📊', label: 'Tiến Độ Học' },
  { path: '/ket-qua-thi',icon: '🏆', label: 'Kết Quả Thi' },
  { path: '/hoc-phi',    icon: '💳', label: 'Học Phí' },
  { path: '/ho-so',      icon: '👤', label: 'Hồ Sơ Cá Nhân' },
]

const UserLayout = () => {
  const { userInfo, hoSo, logout } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tenHV    = hoSo?.ho_ten || userInfo?.ho_ten || 'Học Viên'
  const anhHV    = hoSo?.anh_the || null
  const trangThai = hoSo?.trang_thai || 'cho_dong_hoc_phi'

  const trangThaiLabel = {
    cho_dong_hoc_phi:      { text: 'Chờ đóng học phí', cls: 'badge-warning' },
    cho_mo_lop:            { text: 'Chờ mở lớp',        cls: 'badge-info' },
    dang_hoc:              { text: 'Đang học',           cls: 'badge-success' },
    chua_du_dieu_kien_thi: { text: 'Chưa đủ ĐK thi',    cls: 'badge-danger' },
    du_dieu_kien_thi_tn:   { text: 'Đủ ĐK thi TN',      cls: 'badge-blue' },
    hoan_thanh_tn:         { text: 'Hoàn thành TN',      cls: 'badge-success' },
    da_cap_bang:           { text: 'Đã cấp bằng',        cls: 'badge-success' },
  }[trangThai] || { text: trangThai, cls: 'badge-gray' }

  return (
    <div className="ul-wrapper">
      {/* ── Sidebar ── */}
      <aside className={`ul-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="ul-sidebar-logo">
          <Link to="/">
            <img src="/logo.png" alt="Sao Việt" className="ul-logo-img" />
          </Link>
        </div>

        {/* Avatar học viên */}
        <div className="ul-sidebar-user">
          <div className="ul-avatar">
            {anhHV
              ? <img src={`/${anhHV}`} alt={tenHV} />
              : <span className="ul-avatar-placeholder">{tenHV.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="ul-user-info">
            <p className="ul-user-name">{tenHV}</p>
            <span className={`badge ${trangThaiLabel.cls}`}>{trangThaiLabel.text}</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="ul-nav">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `ul-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="ul-nav-icon">{item.icon}</span>
              <span className="ul-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="ul-logout" onClick={logout}>
          <span>🚪</span> Đăng Xuất
        </button>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="ul-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="ul-main">
        {/* Topbar */}
        <header className="ul-topbar">
          <button className="ul-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <div className="ul-topbar-title">
            <span>Cổng Thông Tin Học Viên</span>
          </div>
          <div className="ul-topbar-right">
            <a href="http://localhost:5174" className="ul-back-home" target="_blank" rel="noreferrer">
              🌐 Trang chủ
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="ul-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout
