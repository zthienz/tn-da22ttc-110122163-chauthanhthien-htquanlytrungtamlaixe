import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTeacher } from '../../context/TeacherContext'
import './Login.css'

const Login = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login, backendUrl }   = useTeacher()
  const navigate                = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${backendUrl}/api/admin/login`, { email, password })
      if (res.data.success) {
        const info = res.data.admin
        if (info.role !== 'giang_vien') {
          toast.error('Tài khoản này không phải giảng viên. Vui lòng dùng cổng quản trị.')
          setLoading(false)
          return
        }
        login(res.data.token, info)
        toast.success(`Chào mừng ${info.ho_ten}!`)
        navigate('/')
      } else {
        toast.error(res.data.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Cột trái */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-logo">
            <span className="login-logo-star">⭐</span>
            <div>
              <p className="login-logo-sub">TRUNG TÂM LÁI XE</p>
              <p className="login-logo-name">SAO VIỆT</p>
            </div>
          </div>
          <h1>Cổng Giảng Viên</h1>
          <p>Hệ thống dành riêng cho giảng viên — xem lớp dạy, điểm danh học viên và quản lý xe thực hành.</p>
          <div className="login-features">
            <div className="login-feature-item">
              <span>🏫</span>
              <div>
                <strong>Lớp Của Tôi</strong>
                <p>Xem danh sách lớp được phân công, học viên và lịch học</p>
              </div>
            </div>
            <div className="login-feature-item">
              <span>✅</span>
              <div>
                <strong>Điểm Danh & Km</strong>
                <p>Điểm danh học viên và ghi nhận số km thực hành mỗi buổi</p>
              </div>
            </div>
            <div className="login-feature-item">
              <span>🚗</span>
              <div>
                <strong>Xe Thực Hành</strong>
                <p>Xem xe được cấp và báo lỗi xe khi phát hiện sự cố</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">👨‍🏫</div>
            <h2>Đăng Nhập Giảng Viên</h2>
            <p>Nhập thông tin tài khoản giảng viên của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-group">
              <label>✉️ Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="giaovien@laixe.com"
                required
                autoFocus
              />
            </div>
            <div className="login-group">
              <label>🔒 Mật khẩu</label>
              <div className="login-pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? <><span className="login-spinner" /> Đang đăng nhập...</>
                : '🔐 Đăng Nhập'}
            </button>
          </form>

          <div className="login-footer">
            <a href="http://localhost:5173" target="_blank" rel="noreferrer">
              👑 Cổng Quản Trị Viên →
            </a>
            <a href="http://localhost:5174" target="_blank" rel="noreferrer">
              🌐 Trang chủ trường lái →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
