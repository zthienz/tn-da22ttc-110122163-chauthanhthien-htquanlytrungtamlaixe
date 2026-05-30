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
                  <li><Link to="/khoa-hoc/a1" onClick={() => setKhoaOpen(false)}>Hạng A1 — Xe máy dưới 125cc</Link></li>
                  <li><Link to="/khoa-hoc/a"  onClick={() => setKhoaOpen(false)}>Hạng A — Xe máy trên 125cc</Link></li>
                  <li><Link to="/khoa-hoc/b1" onClick={() => setKhoaOpen(false)}>Hạng B1 — Ô tô số tự động</Link></li>
                  <li><Link to="/khoa-hoc/b2" onClick={() => setKhoaOpen(false)}>Hạng B2 — Ô tô số sàn</Link></li>
                  <li><Link to="/khoa-hoc/c1" onClick={() => setKhoaOpen(false)}>Hạng C1 — Xe tải nhẹ</Link></li>
                  <li><Link to="/khoa-hoc/c"  onClick={() => setKhoaOpen(false)}>Hạng C — Xe tải nặng</Link></li>
                  <li className="dropdown-group-label">Nâng hạng bằng lái</li>
                  <li><Link to="/khoa-hoc/d"  onClick={() => setKhoaOpen(false)}>Hạng D — Xe khách 9-30 chỗ</Link></li>
                  <li><Link to="/khoa-hoc/e"  onClick={() => setKhoaOpen(false)}>Hạng E — Xe khách trên 30 chỗ</Link></li>
                  <li><Link to="/khoa-hoc/ce" onClick={() => setKhoaOpen(false)}>Hạng CE — Xe đầu kéo</Link></li>
                  <li className="dropdown-divider"><Link to="/khoa-hoc" onClick={() => setKhoaOpen(false)}>Xem tất cả khóa học →</Link></li>
                </ul>
              )}
            </li>
            <li>
              <NavLink to="/tin-tuc" className={({ isActive }) => isActive ? 'active' : ''}>
                Tin Tức
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
