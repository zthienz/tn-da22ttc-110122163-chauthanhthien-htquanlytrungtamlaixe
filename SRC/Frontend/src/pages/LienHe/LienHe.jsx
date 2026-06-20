import { useState } from 'react'
import axios from 'axios'
import './LienHe.css'

const LienHe = () => {
  const [form, setForm] = useState({ ho_ten: '', so_dien_thoai: '', email: '', noi_dung: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.ho_ten.trim()) errs.ho_ten = 'Vui lòng nhập họ và tên.'
    if (form.so_dien_thoai) {
      if (!/^0\d{9}$/.test(form.so_dien_thoai))
        errs.so_dien_thoai = 'Số điện thoại phải 10 số và bắt đầu bằng số 0.'
    }
    if (form.email) {
      if (!/^[^\s@]+@gmail\.com$/.test(form.email))
        errs.email = 'Email phải có dạng @gmail.com.'
    }
    if (!form.noi_dung.trim()) errs.noi_dung = 'Vui lòng nhập nội dung.'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }
    setSending(true)
    try {
      const res = await axios.post('http://localhost:8000/api/lien-he', form)
      if (res.data.success) {
        setSent(true)
        setForm({ ho_ten: '', so_dien_thoai: '', email: '', noi_dung: '' })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi thất bại, vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="lienhe-page">
      <div className="lienhe-hero">
        <div className="container">
          <h1>Liên Hệ</h1>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <div className="container lienhe-content">
        <div className="lienhe-grid">
          {/* Thông tin */}
          <div className="lienhe-info">
            <h3>Thông tin liên hệ</h3>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <strong>Trụ sở chính</strong>
                <p>495C Đường CMT8, Phường Hoà Hưng (P.13, Q.10 cũ), TP.HCM</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📞</span>
              <div>
                <strong>Hotline tư vấn</strong>
                <p><a href="tel:0934057333">0934 057 333</a></p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <p>daotolaixesaoviet@gmail.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🕐</span>
              <div>
                <strong>Giờ làm việc</strong>
                <p>Thứ 2 – Thứ 7: 07:00 – 20:00</p>
                <p>Chủ nhật: 08:00 – 17:00</p>
              </div>
            </div>

            <div className="lienhe-map">
              <iframe
                title="Bản đồ"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzEyLjAiTiAxMDbCsDM2JzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1"
                width="100%" height="220"
                style={{ border: 0, borderRadius: '10px' }}
                allowFullScreen="" loading="lazy"
              />
            </div>
          </div>

          {/* Form liên hệ */}
          <div className="lienhe-form-box">
            <h3>Gửi tin nhắn cho chúng tôi</h3>

            {sent ? (
              <div className="lienhe-success">
                <div style={{ fontSize: 48 }}>✅</div>
                <h4>Gửi thành công!</h4>
                <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ liên hệ lại sớm nhất.</p>
                <button className="btn-lienhe" style={{ marginTop: 16 }} onClick={() => setSent(false)}>
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form className="lienhe-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ và tên <span style={{ color: '#e53935' }}>*</span></label>
                  <input name="ho_ten" type="text" placeholder="Nguyễn Văn A"
                    value={form.ho_ten} onChange={handleChange} required />
                  {fieldErrors.ho_ten && <span className="field-error">{fieldErrors.ho_ten}</span>}
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input name="so_dien_thoai" type="tel" placeholder="0912 345 678"
                      value={form.so_dien_thoai} onChange={handleChange} maxLength={10} />
                    {fieldErrors.so_dien_thoai && <span className="field-error">{fieldErrors.so_dien_thoai}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="text" placeholder="example@gmail.com"
                      value={form.email} onChange={handleChange} />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Nội dung <span style={{ color: '#e53935' }}>*</span></label>
                  <textarea name="noi_dung" rows={5} placeholder="Nội dung cần tư vấn..."
                    value={form.noi_dung} onChange={handleChange} required />
                  {fieldErrors.noi_dung && <span className="field-error">{fieldErrors.noi_dung}</span>}
                </div>
                {error && <p style={{ color: '#e53935', fontSize: 13, marginBottom: 8 }}>{error}</p>}
                <button type="submit" className="btn-lienhe" disabled={sending}>
                  {sending ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LienHe
