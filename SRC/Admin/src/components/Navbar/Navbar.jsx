import { useAdmin } from '../../context/AdminContext'
import './Navbar.css'

const Navbar = () => {
  const { adminInfo, logout } = useAdmin()

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h3>Hệ Thống Quản Lý Đào Tạo Lái Xe</h3>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">👤 {adminInfo?.name || 'Admin'}</span>
        <button className="navbar-logout" onClick={logout}>Đăng xuất</button>
      </div>
    </header>
  )
}

export default Navbar
