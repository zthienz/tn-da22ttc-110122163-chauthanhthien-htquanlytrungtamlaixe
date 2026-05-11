import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import './Register.css'

const Register = () => {
  const [form, setForm] = useState({ ho_ten: '', email: '', so_dien_thoai: '', password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const { backendUrl } = useUser()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${backendUrl}/api/hoc-vien/register`, form)
      if (res.data.success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
        navigate('/login')
      } else {
        toast.error(res.data.message || 'Đăng ký thất bại')
      }
    } catch {
      toast.error('Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h2>Đăng Ký Học Viên</h2>
          <p>Tạo tài khoản để theo dõi lịch học và kết quả thi</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          {[
            { name: 'ho_ten',         label: 'Họ và Tên',       type: 'text',     placeholder: 'Nguyễn Văn A' },
            { name: 'email',          label: 'Email',            type: 'email',    placeholder: 'email@example.com' },
            { name: 'so_dien_thoai',  label: 'Số Điện Thoại',   type: 'tel',      placeholder: '0123 456 789' },
            { name: 'password',       label: 'Mật Khẩu',        type: 'password', placeholder: '••••••••' },
            { name: 'confirm_password', label: 'Xác Nhận Mật Khẩu', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>
        <p className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
