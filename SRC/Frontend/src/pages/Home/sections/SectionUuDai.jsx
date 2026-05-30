import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './SectionUuDai.css'

const uuDaiItems = [
  'Tặng bộ sách, tài liệu, mẹo học thi trị giá 300.000đ',
  'Hỗ trợ ghi danh đăng ký Online nhanh gọn',
  'Điền form tư vấn để được hỗ trợ tốt nhất',
]

const khoaOptions = [
  'Học lái xe hạng A, A1',
  'Học lái xe hạng B2 Số Sàn',
  'Học lái xe hạng B1 Số Tự Động',
  'Học lái xe hạng C1',
]

const SectionUuDai = () => {
  const [form, setForm] = useState({
    ho_ten: '', dien_thoai: '', khu_vuc: '', khoa_hoc: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.ho_ten || !form.dien_thoai || !form.khoa_hoc) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    setLoading(true)
    try {
      await axios.post('http://localhost:8000/api/dang-ky-tu-van', form)
      toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.')
      setForm({ ho_ten: '', dien_thoai: '', khu_vuc: '', khoa_hoc: '' })
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.')
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
            <form onSubmit={handleSubmit} className="ud-form">
              <input
                type="text"
                name="ho_ten"
                placeholder="Họ và tên"
                value={form.ho_ten}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="dien_thoai"
                placeholder="Điện thoại"
                value={form.dien_thoai}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="khu_vuc"
                placeholder="Bạn ở khu vực nào?"
                value={form.khu_vuc}
                onChange={handleChange}
              />

              <div className="ud-radio-group">
                <p className="ud-radio-label">🔷 Bạn quan tâm đến? <span className="required">*</span></p>
                {khoaOptions.map((opt, i) => (
                  <label key={i} className="ud-radio-item">
                    <input
                      type="radio"
                      name="khoa_hoc"
                      value={opt}
                      checked={form.khoa_hoc === opt}
                      onChange={handleChange}
                      required
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              <button type="submit" className="ud-submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Đăng Ký Ngay'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  )
}

export default SectionUuDai
