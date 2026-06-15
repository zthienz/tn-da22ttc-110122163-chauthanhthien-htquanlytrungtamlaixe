import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import axios from 'axios'
import './Navbar.css'

// Mapping loai_bang → label hiển thị trong dropdown
const BANG_LABEL = {
  A1: 'Hạng A1 — Xe máy dưới 125cc',
  A:  'Hạng A — Xe máy trên 125cc',
  B1: 'Hạng B1 — Ô tô số tự động',
  B2: 'Hạng B2 — Ô tô số sàn',
  C1: 'Hạng C1 — Xe tải nhẹ',
  C:  'Hạng C — Xe tải nặng',
  D:  'Hạng D — Xe khách 9-30 chỗ',
  E:  'Hạng E — Xe khách trên 30 chỗ',
  CE: 'Hạng CE — Xe đầu kéo',
}

// Các hạng nâng cấp bằng lái (hiển thị dưới nhãn phân cách)
const NANG_HANG = ['D', 'E', 'CE']

const Navbar = () => {
  const [khoaOpen, setKhoaOpen]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [bangLais, setBangLais]   = useState([])

  useEffect(() => {
    axios.get('http://localhost:8000/api/khoa-hoc')
      .then(res => { if (res.data.success) setBangLais(res.data.data) })
      .catch(() => {}) // giữ dropdown rỗng nếu API lỗi
  }, [])

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
                  {/* Nhóm hạng thường */}
                  {bangLais
                    .filter(k => !NANG_HANG.includes(k.loai_bang))
                    .map(k => (
                      <li key={k.id}>
                        <Link to={`/khoa-hoc/${k.loai_bang.toLowerCase()}`} onClick={() => setKhoaOpen(false)}>
                          {BANG_LABEL[k.loai_bang] || k.ten_khoa}
                        </Link>
                      </li>
                    ))
                  }
                  {/* Nhóm nâng hạng — chỉ hiện nhãn nếu có ít nhất 1 hạng nâng cấp active */}
                  {bangLais.some(k => NANG_HANG.includes(k.loai_bang)) && (
                    <li className="dropdown-group-label">Nâng hạng bằng lái</li>
                  )}
                  {bangLais
                    .filter(k => NANG_HANG.includes(k.loai_bang))
                    .map(k => (
                      <li key={k.id}>
                        <Link to={`/khoa-hoc/${k.loai_bang.toLowerCase()}`} onClick={() => setKhoaOpen(false)}>
                          {BANG_LABEL[k.loai_bang] || k.ten_khoa}
                        </Link>
                      </li>
                    ))
                  }
                  <li className="dropdown-divider">
                    <Link to="/khoa-hoc" onClick={() => setKhoaOpen(false)}>Xem tất cả khóa học →</Link>
                  </li>
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
