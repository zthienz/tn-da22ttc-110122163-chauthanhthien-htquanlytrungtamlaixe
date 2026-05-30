import { Link } from 'react-router-dom'
import './SectionKhoaHoc.css'

// Ảnh mặc định theo loại bằng
const BANG_IMG = {
  A1:  '/bang-lai-a1.jpg',
  A:   '/bang-lai-a-tren-125cc.jpg',
  B1:  '/bang-lai-b1-1.jpg',
  B2:  '/bang-lai-b1-2.png',
  C1:  '/bang-lai-c1-tai-nhe.jpg',
  C:   '/bang-lai-c1-tai-nang.png',
  D:   '/bang-lai-d.jpg',
  E:   '/bang-lai-e.jpg',
  CE:  '/bang-lai-ce.jpg',
}

// Thứ tự hiển thị từ thấp đến cao
const BANG_ORDER = ['A1','A','B1','B2','C1','C','D','E','CE']

// Màu header card theo loại bằng
const BANG_COLOR = {
  A1: 'linear-gradient(90deg,#f7971e,#ffd200)',
  A:  'linear-gradient(90deg,#f7971e,#ff6b35)',
  B1: 'linear-gradient(90deg,#0066cc,#0099ff)',
  B2: 'linear-gradient(90deg,#00b09b,#96c93d)',
  C1: 'linear-gradient(90deg,#1565c0,#283593)',
  C:  'linear-gradient(90deg,#1a237e,#283593)',
  D:  'linear-gradient(90deg,#6a1b9a,#9c27b0)',
  E:  'linear-gradient(90deg,#880e4f,#c2185b)',
  CE: 'linear-gradient(90deg,#b71c1c,#e53935)',
}

// Thông tin chi tiết theo từng loại bằng
const BANG_DETAIL = {
  A1: { tuoi: '>= 16 tuổi', thoiGian: '30 ngày đào tạo', loaiXe: 'Xe máy dưới 125cc' },
  A:  { tuoi: '>= 18 tuổi', thoiGian: '35 ngày đào tạo', loaiXe: 'Xe máy phân khối lớn trên 125cc' },
  B1: { tuoi: '>= 18 tuổi', thoiGian: '65 ngày đào tạo', loaiXe: 'Ô tô số tự động dưới 9 chỗ' },
  B2: { tuoi: '>= 18 tuổi', thoiGian: '75 ngày đào tạo', loaiXe: 'Ô tô số sàn dưới 9 chỗ (Vios, Altis)' },
  C1: { tuoi: '>= 21 tuổi', thoiGian: '78 ngày đào tạo', loaiXe: 'Xe tải nhẹ 3.5 - 7.5 tấn' },
  C:  { tuoi: '>= 21 tuổi', thoiGian: '90 ngày đào tạo', loaiXe: 'Xe tải nặng trên 7.5 tấn' },
  D:  { tuoi: '>= 21 tuổi', thoiGian: '60 ngày đào tạo', loaiXe: 'Xe khách 9 - 30 chỗ ngồi' },
  E:  { tuoi: '>= 24 tuổi', thoiGian: '60 ngày đào tạo', loaiXe: 'Xe khách trên 30 chỗ ngồi' },
  CE: { tuoi: '>= 21 tuổi', thoiGian: '70 ngày đào tạo', loaiXe: 'Xe đầu kéo, xe container' },
}

const CheckItem = ({ text }) => (
  <li className="kh-check-item">
    <span className="kh-check-icon">✓</span>
    <span>{text}</span>
  </li>
)

const KhoaHocCard = ({ kh }) => {
  const detail  = BANG_DETAIL[kh.loai_bang] || BANG_DETAIL.B2
  const slug    = kh.loai_bang?.toLowerCase()

  return (
    <div className="kh-card">
      {/* Ảnh */}
      <div className="kh-card-img">
        <img src={BANG_IMG[kh.loai_bang] || '/bang-lai-b1-2.png'} alt={kh.ten_khoa} />
      </div>

      {/* Header màu */}
      <div className="kh-card-header" style={{ background: BANG_COLOR[kh.loai_bang] || BANG_COLOR.B2 }}>
        <h3>{kh.ten_khoa}</h3>
      </div>

      {/* Giá */}
      <div className="kh-card-price">
        <span className="price-main">{Number(kh.hoc_phi).toLocaleString('vi-VN')} đ</span>
        <p className="price-note">Hồ sơ trọn gói không phát sinh</p>
      </div>

      {/* Thông tin */}
      <ul className="kh-card-info">
        <CheckItem text={`Độ tuổi đăng ký: ${detail.tuoi}`} />
        <CheckItem text="Khai giảng: đúng khóa" />
        <CheckItem text={`Thời gian học: ${detail.thoiGian}`} />
        <CheckItem text="Thời gian học: linh hoạt" />
        <CheckItem text={`Loại xe: ${detail.loaiXe}`} />
      </ul>

      {/* Nút đăng ký */}
      <div className="kh-card-footer">
        <Link to={`/khoa-hoc/${slug}`} className="btn-dang-ky">XEM CHI TIẾT</Link>
        <p className="kh-hotline">📞 Hotline tư vấn: <strong>0934 057 333</strong></p>
      </div>
    </div>
  )
}

const SectionKhoaHoc = ({ khoaHocList }) => {
  // Dữ liệu mẫu fallback khi chưa có API
  const fallback = [
    { id:1, ten_khoa:'Bằng lái xe hạng A1',           loai_bang:'A1', hoc_phi:2000000  },
    { id:2, ten_khoa:'Bằng lái xe hạng A (>125cc)',   loai_bang:'A',  hoc_phi:3000000  },
    { id:3, ten_khoa:'Bằng lái xe hạng B1',           loai_bang:'B1', hoc_phi:15000000 },
    { id:4, ten_khoa:'Bằng lái xe hạng B2',           loai_bang:'B2', hoc_phi:18000000 },
    { id:5, ten_khoa:'Bằng lái xe hạng C1 (tải nhẹ)', loai_bang:'C1', hoc_phi:22000000 },
    { id:6, ten_khoa:'Bằng lái xe hạng C (tải nặng)', loai_bang:'C',  hoc_phi:26000000 },
    { id:7, ten_khoa:'Nâng hạng bằng lái xe hạng D',  loai_bang:'D',  hoc_phi:10000000 },
    { id:8, ten_khoa:'Nâng hạng bằng lái xe hạng E',  loai_bang:'E',  hoc_phi:11000000 },
    { id:9, ten_khoa:'Nâng hạng bằng lái xe hạng CE', loai_bang:'CE', hoc_phi:19000000 },
  ]

  // Nếu có data từ API: deduplicate theo loai_bang, chỉ giữ 1 đại diện mỗi hạng
  // Ưu tiên lấy tên chuẩn từ BANG_TEN, học phí từ record đầu tiên của hạng đó
  const BANG_TEN = {
    A1: 'Bằng lái xe hạng A1',
    A:  'Bằng lái xe hạng A (Xe trên 125cc)',
    B1: 'Bằng lái xe hạng B1',
    B2: 'Bằng lái xe hạng B2',
    C1: 'Bằng lái xe hạng C1 (Xe tải nhẹ)',
    C:  'Bằng lái xe hạng C (Xe tải nặng)',
    D:  'Nâng hạng bằng lái xe hạng D',
    E:  'Nâng hạng bằng lái xe hạng E',
    CE: 'Nâng hạng bằng lái xe hạng CE',
  }

  let displayList
  if (khoaHocList.length > 0) {
    // API đã trả về đúng loại bằng lái, dùng tên từ API
    displayList = khoaHocList.map(kh => ({ ...kh }))
  } else {
    displayList = fallback
  }

  // Sắp xếp theo thứ tự chuẩn
  displayList = [...displayList].sort((a, b) =>
    BANG_ORDER.indexOf(a.loai_bang) - BANG_ORDER.indexOf(b.loai_bang)
  )

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
