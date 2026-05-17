import { Link } from 'react-router-dom'
import './SectionKhoaHoc.css'

// Ảnh mặc định theo loại bằng
const BANG_IMG = {
  B1: '/xe1.png',
  B2: '/xe2.png',
  C:  '/xe3.png',
  C1: '/xe3.png',
  A1: '/xe1.png',
  A2: '/xe1.png',
}

// Màu header card theo loại bằng
const BANG_COLOR = {
  B1: 'linear-gradient(90deg,#0066cc,#0099ff)',
  B2: 'linear-gradient(90deg,#00b09b,#96c93d)',
  C:  'linear-gradient(90deg,#1565c0,#283593)',
  C1: 'linear-gradient(90deg,#1565c0,#283593)',
  A1: 'linear-gradient(90deg,#f7971e,#ffd200)',
  A2: 'linear-gradient(90deg,#f7971e,#ffd200)',
}

const CheckItem = ({ text }) => (
  <li className="kh-check-item">
    <span className="kh-check-icon">✓</span>
    <span>{text}</span>
  </li>
)

const KhoaHocCard = ({ kh }) => {
  const giaGoc = Number(kh.hoc_phi) * 1.1  // giá gốc giả định +10%
  return (
    <div className="kh-card">
      {/* Ảnh */}
      <div className="kh-card-img">
        <img src={BANG_IMG[kh.loai_bang] || '/xe-b2.jpg'} alt={kh.ten_khoa} />
      </div>

      {/* Header màu */}
      <div className="kh-card-header" style={{ background: BANG_COLOR[kh.loai_bang] || BANG_COLOR.B2 }}>
        <h3>{kh.ten_khoa}</h3>
      </div>

      {/* Giá */}
      <div className="kh-card-price">
        <span className="price-old">{Math.round(giaGoc).toLocaleString('vi-VN')}</span>
        <span className="price-new">{Number(kh.hoc_phi).toLocaleString('vi-VN')}</span>
        <p className="price-note">Hồ sơ trọn gói không phát sinh</p>
      </div>

      {/* Thông tin */}
      <ul className="kh-card-info">
        <CheckItem text="Độ tuổi đăng ký: >= 18" />
        <CheckItem text="Khai giảng: đúng khóa" />
        <CheckItem text={`Thời gian học: ${kh.thoi_gian_ngay || 75} ngày đào tạo`} />
        <CheckItem text="Thời gian học: linh hoạt" />
        <CheckItem text="Loại xe: xe Vios, Altis đời cao" />
      </ul>

      {/* Nút đăng ký */}
      <div className="kh-card-footer">
        <Link to="/dang-ky" className="btn-dang-ky">ĐĂNG KÝ</Link>
        <p className="kh-voucher">Đăng Ký Hôm Nay Nhận voucher <strong>500k</strong></p>
        <p className="kh-hotline">📞 Hotline tư vấn: <strong>0934 057 333</strong> 🔥🔥</p>
      </div>
    </div>
  )
}

const SectionKhoaHoc = ({ khoaHocList }) => {
  // Nếu chưa có data từ API, dùng data mẫu
  const displayList = khoaHocList.length > 0 ? khoaHocList : [
    { id:1, ten_khoa:'Bằng Ô Tô Hạng B Số Tự Động', loai_bang:'B1', hoc_phi:15000000, thoi_gian_ngay:65 },
    { id:2, ten_khoa:'Bằng Ô Tô Hạng B Số Sàn',     loai_bang:'B2', hoc_phi:18000000, thoi_gian_ngay:75 },
    { id:3, ten_khoa:'Bằng Ô Tô Hạng C1 Xe Tải',    loai_bang:'C1', hoc_phi:20200000, thoi_gian_ngay:78 },
  ]

  return (
    <section className="section-kh">
      <div className="container">
        <h2 className="section-title">Các khóa đào tạo lái xe tại Trung Tâm SAO VIỆT</h2>
        <div className="kh-grid">
          {displayList.map(kh => <KhoaHocCard key={kh.id} kh={kh} />)}
        </div>
      </div>
    </section>
  )
}

export default SectionKhoaHoc
