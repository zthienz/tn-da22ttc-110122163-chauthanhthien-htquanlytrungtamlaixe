import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [khoaOpen, setKhoaOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Trung Tâm Dạy Lái Xe Sao Việt</span>
          <span>📞 0934 057 333</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src="/logo-trungtamsaoviet.png" alt="Sao Việt" className="logo-img" />
          </Link>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>

          {/* Menu */}
          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Trang chủ
              </NavLink>
            </li>
            <li
              className="has-dropdown"
              onMouseEnter={() => setKhoaOpen(true)}
              onMouseLeave={() => setKhoaOpen(false)}
            >
              <span className={`nav-link ${khoaOpen ? 'active' : ''}`}>
                Các khoá học <span className="arrow">▾</span>
              </span>
              {khoaOpen && (
                <ul className="dropdown">
                  <li><Link to="/khoa-hoc/b1">Học lái xe ô tô hạng B (Số tự động)</Link></li>
                  <li><Link to="/khoa-hoc/b2">Học lái xe ô tô hạng B (Số sàn)</Link></li>
                  <li><Link to="/khoa-hoc/c1">Học lái xe ô tô tải hạng C1</Link></li>
                  <li><Link to="/khoa-hoc/a1">Học bằng lái xe hạng A1, A2</Link></li>
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? 'active' : ''}>
                Tin Tức
              </NavLink>
            </li>
            <li>
              <NavLink to="/lich-thi" className={({ isActive }) => isActive ? 'active' : ''}>
                Lịch thi
              </NavLink>
            </li>
            <li>
              <NavLink to="/lien-he" className={({ isActive }) => isActive ? 'active' : ''}>
                Liên hệ
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

export default Navbar
