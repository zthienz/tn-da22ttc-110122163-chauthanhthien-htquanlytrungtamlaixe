import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './DangKy.css'

const khoaOptions = [
  'Học lái xe hạng A, A1',
  'Học lái xe hạng B2 Số Sàn',
  'Học lái xe hạng B1 Số Tự Động',
  'Học lái xe hạng C1',
]

const DangKy = () => {
  const [form, setForm] = useState({
    ho_ten: '', dien_thoai: '', email: '', khu_vuc: '', khoa_hoc: '', ghi_chu: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:8000/api/dang-ky-tu-van', form)
      setDone(true)
      toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ bạn trong 24h.')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dangky-page">
      <div className="dangky-hero">
        <div className="container">
          <h1>Đăng Ký Tư Vấn</h1>
          <p>Điền thông tin để nhận tư vấn miễn phí và ưu đãi lên đến 2.000.000đ</p>
        </div>
      </div>

      <div className="container dangky-content">
        {done ? (
          <div className="dangky-success">
            <div className="success-icon">✓</div>
            <h2>Đăng ký thành công!</h2>
            <p>Cảm ơn bạn đã quan tâm đến Trung Tâm Lái Xe Sao Việt.<br />
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            <button onClick={() => setDone(false)} className="btn-back">Đăng ký thêm</button>
          </div>
        ) : (
          <div className="dangky-grid">
            {/* Ưu đãi */}
            <div className="dangky-uudai">
              <h3>Ưu đãi khi đăng ký</h3>
              <ul>
                {[
                  '🎁 Tặng gói học lái xe ô tô 2.000.000đ',
                  '💰 Giảm thêm 500.000đ khi đăng ký theo nhóm',
                  '📚 Tặng bộ sách, tài liệu thi trị giá 300.000đ',
                  '⚡ Hỗ trợ ghi danh Online nhanh gọn',
                  '🎯 Tư vấn 1-1 với chuyên viên',
                ].map((item, i) => (
                  <li key={i}><span className="ud-check">✓</span><span>{item}</span></li>
                ))}
              </ul>
              <div className="dangky-contact">
                <p>📞 Hotline: <strong>0934 057 333</strong></p>
                <p>✉️ daotolaixesaoviet@gmail.com</p>
              </div>
            </div>

            {/* Form */}
            <div className="dangky-form-box">
              <h3>Điền thông tin đăng ký</h3>
              <form onSubmit={handleSubmit} className="dangky-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên <span className="req">*</span></label>
                    <input name="ho_ten" value={form.ho_ten} onChange={handleChange}
                      placeholder="Nguyễn Văn A" required />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại <span className="req">*</span></label>
                    <input name="dien_thoai" value={form.dien_thoai} onChange={handleChange}
                      placeholder="0912 345 678" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="email@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Khu vực</label>
                    <input name="khu_vuc" value={form.khu_vuc} onChange={handleChange}
                      placeholder="Quận / Huyện" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Khóa học quan tâm <span className="req">*</span></label>
                  <div className="radio-grid">
                    {khoaOptions.map((opt, i) => (
                      <label key={i} className="radio-item">
                        <input type="radio" name="khoa_hoc" value={opt}
                          checked={form.khoa_hoc === opt} onChange={handleChange} required />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Ghi chú thêm</label>
                  <textarea name="ghi_chu" value={form.ghi_chu} onChange={handleChange}
                    placeholder="Thời gian rảnh, câu hỏi..." rows={3} />
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Đăng Ký Ngay'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DangKy
