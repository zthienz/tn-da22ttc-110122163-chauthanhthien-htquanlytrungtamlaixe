import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './SectionUuDai.css'

const uuDaiItems = [
  'Tặng bộ sách, tài liệu, mẹo học thi trị giá 300.000đ',
  'Hỗ trợ ghi danh đăng ký Online nhanh gọn',
  'Điền form tư vấn để được hỗ trợ tốt nhất',
]

const BACKEND_URL = 'http://localhost:8000'

const SectionUuDai = () => {
  const [form, setForm] = useState({
    ho_ten: '', so_dien_thoai: '', email: '', noi_dung: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.ho_ten.trim()) errs.ho_ten = 'Vui lòng nhập họ và tên.'
    if (form.so_dien_thoai && !/^0\d{9}$/.test(form.so_dien_thoai))
      errs.so_dien_thoai = 'Số điện thoại phải 10 số và bắt đầu bằng số 0.'
    if (form.email && !/^[^\s@]+@gmail\.com$/.test(form.email))
      errs.email = 'Email phải có dạng @gmail.com.'
    if (!form.noi_dung.trim()) errs.noi_dung = 'Vui lòng nhập nội dung cần tư vấn.'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }
    setLoading(true)
    try {
      const res = await axios.post(`${BACKEND_URL}/api/lien-he`, form)
      if (res.data.success) {
        setSent(true)
        setForm({ ho_ten: '', so_dien_thoai: '', email: '', noi_dung: '' })
        setFieldErrors({})
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section-ud">
      <div className="container ud-grid">

        {/* Cột trái — Ưu đãi */}
        <div className="ud-left">
          <h3>Ưu đãi tại Trung Tâm Lái Xe Sao Việt</h3>
          <p className="ud-sub">Hỗ trợ đăng ký nhanh chóng, tiện lợi</p>
          <ul className="ud-list">
            {uuDaiItems.map((item, i) => (
              <li key={i}>
                <span className="ud-check">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột phải — Form */}
        <div className="ud-right">
          <div className="ud-form-wrapper">
            <h3 className="ud-form-title">ĐĂNG KÝ TƯ VẤN MIỄN PHÍ</h3>

            {sent ? (
              <div className="ud-success">
                <div style={{ fontSize: 48, textAlign: 'center' }}>✅</div>
                <h4 style={{ textAlign: 'center', color: '#2e7d32', margin: '12px 0 8px' }}>Gửi thành công!</h4>
                <p style={{ textAlign: 'center', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                  Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ lại sớm nhất.
                </p>
                <button className="ud-submit" style={{ marginTop: 16 }} onClick={() => setSent(false)}>
                  Đăng ký tư vấn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ud-form">
                {/* Họ và tên */}
                <div className="ud-form-group">
                  <label className="ud-label">Họ và tên <span className="required">*</span></label>
                  <input
                    type="text" name="ho_ten"
                    placeholder="Nguyễn Văn A"
                    value={form.ho_ten} onChange={handleChange}
                    className={fieldErrors.ho_ten ? 'input-error' : ''}
                  />
                  {fieldErrors.ho_ten && <span className="ud-field-error">{fieldErrors.ho_ten}</span>}
                </div>

                {/* SĐT + Email */}
                <div className="ud-form-row-2">
                  <div className="ud-form-group">
                    <label className="ud-label">Số điện thoại</label>
                    <input
                      type="tel" name="so_dien_thoai"
                      placeholder="0912 345 678"
                      value={form.so_dien_thoai} onChange={handleChange}
                      maxLength={10}
                      className={fieldErrors.so_dien_thoai ? 'input-error' : ''}
                    />
                    {fieldErrors.so_dien_thoai && <span className="ud-field-error">{fieldErrors.so_dien_thoai}</span>}
                  </div>
                  <div className="ud-form-group">
                    <label className="ud-label">Email</label>
                    <input
                      type="text" name="email"
                      placeholder="example@gmail.com"
                      value={form.email} onChange={handleChange}
                      className={fieldErrors.email ? 'input-error' : ''}
                    />
                    {fieldErrors.email && <span className="ud-field-error">{fieldErrors.email}</span>}
                  </div>
                </div>

                {/* Nội dung */}
                <div className="ud-form-group">
                  <label className="ud-label">Nội dung <span className="required">*</span></label>
                  <textarea
                    name="noi_dung" rows={4}
                    placeholder="Nội dung cần tư vấn..."
                    value={form.noi_dung} onChange={handleChange}
                    className={fieldErrors.noi_dung ? 'input-error' : ''}
                  />
                  {fieldErrors.noi_dung && <span className="ud-field-error">{fieldErrors.noi_dung}</span>}
                </div>

                <button type="submit" className="ud-submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}

export default SectionUuDai
