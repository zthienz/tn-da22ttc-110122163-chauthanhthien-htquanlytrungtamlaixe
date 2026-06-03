import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import './Login.css'

const Login = () => {
  const [soCccd, setSoCccd]     = useState('')
  const [ngaySinh, setNgaySinh] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login, backendUrl }   = useUser()
  const navigate                = useNavigate()

  // Hiển thị thông báo nếu bị logout cưỡng bức (hồ sơ bị xóa)
  useEffect(() => {
    const msg = localStorage.getItem('logoutMessage')
    if (msg) {
      toast.error(msg, { autoClose: 6000 })
      localStorage.removeItem('logoutMessage')
    }
  }, [])
  const handleSubmit = async e => {
    e.preventDefault()
    if (!soCccd.trim()) { toast.error('Vui lòng nhập số CCCD'); return }
    if (!ngaySinh)      { toast.error('Vui lòng nhập ngày sinh'); return }
    if (ngaySinh.length !== 8) { toast.error('Ngày sinh phải đúng 8 số — VD: 16052004'); return }

    setLoading(true)
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        so_cccd:   soCccd.trim(),
        ngay_sinh: ngaySinh.trim(),
      })

      if (res.data.success) {
        login(res.data.token, res.data.user)
        toast.success(`Chào mừng ${res.data.user.ho_ten}!`)
        navigate('/')
      } else {
        toast.error(res.data.message || 'Đăng nhập thất bại')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi kết nối server'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Cột trái — Giới thiệu */}
      <div className="login-left">
        <img src="/logo.png" alt="Sao Việt" className="login-logo" />
        <h2>Trung Tâm Dạy Lái Xe Sao Việt</h2>
        <p>Cổng thông tin dành riêng cho học viên.<br />Theo dõi tiến độ học tập và kết quả thi.</p>
        <ul className="login-features">
          {[
            'Xem lịch học theo thời gian thực',
            'Theo dõi tiến độ lý thuyết & thực hành',
            'Kiểm tra kết quả thi tốt nghiệp & sát hạch',
            'Quản lý học phí & lịch sử thanh toán',
          ].map((f, i) => (
            <li key={i}><span className="lf-check">✓</span>{f}</li>
          ))}
        </ul>

        {/* Hướng dẫn đăng nhập */}
        <div className="login-guide">
          <h4>📋 Hướng dẫn đăng nhập</h4>
          <div className="guide-item">
            <span className="guide-icon">🪪</span>
            <div>
              <strong>Tài khoản</strong>
              <p>Số căn cước công dân (CCCD)</p>
            </div>
          </div>
          <div className="guide-item">
            <span className="guide-icon">🎂</span>
            <div>
              <strong>Mật khẩu mặc định</strong>
              <p>Ngày sinh theo định dạng <strong>DDMMYYYY</strong></p>
              <p className="guide-example">Ví dụ: sinh 16/05/2004 → <code>16052004</code></p>
            </div>
          </div>
          <p className="guide-note">
            💡 Tài khoản do trung tâm cấp sau khi bạn hoàn tất đóng học phí và được xếp lớp.
          </p>
        </div>
      </div>

      {/* Cột phải — Form đăng nhập */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <img src="/logo.png" alt="logo" className="login-card-logo" />
            <h3>Đăng Nhập Học Viên</h3>
            <p>Nhập thông tin do trung tâm cung cấp</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* CCCD */}
            <div className="lf-group">
              <label>
                <span className="lf-label-icon">🪪</span>
                Số Căn Cước Công Dân (CCCD)
              </label>
              <div className="lf-input-wrap">
                <input
                  type="text"
                  value={soCccd}
                  onChange={e => setSoCccd(e.target.value)}
                  placeholder="Nhập số CCCD của bạn"
                  maxLength={12}
                  required
                />
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="lf-group">
              <label>
                <span className="lf-label-icon">🎂</span>
                Ngày Sinh (Mật khẩu mặc định)
              </label>
              <div className="lf-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={ngaySinh}
                  onChange={e => setNgaySinh(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="VD: 16052004"
                  maxLength={8}
                  required
                />
                <button
                  type="button"
                  className="lf-eye"
                  onClick={() => setShowPass(!showPass)}
                  title={showPass ? 'Ẩn' : 'Hiện'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="lf-hint">
                Định dạng DDMMYYYY — VD: sinh 16/05/2004 nhập <code>16052004</code>
              </p>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> Đang đăng nhập...</>
                : '🔐 Đăng Nhập'
              }
            </button>
          </form>

          {/* Liên hệ hỗ trợ */}
          <div className="login-support">
            <p>Chưa có tài khoản hoặc quên mật khẩu?</p>
            <a href="tel:0934057333" className="support-phone">
              📞 Liên hệ trung tâm: <strong>0934 057 333</strong>
            </a>
          </div>

          <p className="login-back">
            <a href="http://localhost:5174">← Về trang chủ trường lái</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
