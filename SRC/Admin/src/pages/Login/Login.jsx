import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './Login.css'

const Login = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login, backendUrl }   = useAdmin()
  const navigate                = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${backendUrl}/api/admin/login`, { email, password })
      if (res.data.success) {
        const info = res.data.admin
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
    <div className="al-page">
      {/* Cột trái */}
      <div className="al-left">
        <img src="/logo.png" alt="Sao Việt" className="al-logo" />
        <h1>Trung Tâm Dạy Lái Xe<br /><span>Sao Việt</span></h1>
        <p>Hệ thống quản trị dành cho Quản Trị Viên và Giảng Viên</p>
        <div className="al-roles">
          <div className="al-role-card">
            <span>👑</span>
            <div>
              <strong>Quản Trị Viên</strong>
              <p>Toàn quyền quản lý hệ thống, học viên, lớp học, thi cử</p>
            </div>
          </div>
          <div className="al-role-card">
            <span>👨‍🏫</span>
            <div>
              <strong>Giảng Viên</strong>
              <p>Xem lớp dạy, điểm danh học viên, ghi nhận km thực hành</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải */}
      <div className="al-right">
        <div className="al-card">
          <div className="al-card-header">
            <img src="/logo.png" alt="logo" className="al-card-logo" />
            <h2>Đăng Nhập Quản Trị</h2>
            <p>Nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="al-form">
            <div className="al-group">
              <label>✉️ Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@laixe.com" required />
            </div>
            <div className="al-group">
              <label>🔒 Mật khẩu</label>
              <div className="al-pass-wrap">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="al-submit" disabled={loading}>
              {loading ? <><span className="al-spinner" /> Đang đăng nhập...</> : '🔐 Đăng Nhập'}
            </button>
          </form>

          <p className="al-back">
            <a href="http://localhost:5174">← Về trang chủ trường lái</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
