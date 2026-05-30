import { useState } from 'react'
import { Link } from 'react-router-dom'
import './TinTuc.css'

// ── Dữ liệu mẫu ──────────────────────────────────────────────────────────────
const danhSachTin = [
  {
    id: 1,
    tieu_de: 'Quy định mới về đào tạo lái xe ô tô năm 2025 — Những điểm cần biết',
    tom_tat: 'Bộ Giao thông Vận tải vừa ban hành thông tư mới quy định về chương trình đào tạo lái xe, tăng số giờ thực hành và bổ sung nội dung kỹ năng xử lý tình huống khẩn cấp.',
    hinh: '/banner.jpg',
    danh_muc: 'Quy định pháp luật',
    ngay: '15/05/2025',
    luot_xem: 1240,
    noi_bat: true,
  },
  {
    id: 2,
    tieu_de: 'Hướng dẫn chuẩn bị hồ sơ thi bằng lái xe B2 từ A đến Z',
    tom_tat: 'Để thi bằng lái xe B2, học viên cần chuẩn bị đầy đủ các giấy tờ theo quy định. Bài viết tổng hợp chi tiết danh sách hồ sơ và lưu ý quan trọng.',
    hinh: '/gioithieu.png',
    danh_muc: 'Hướng dẫn',
    ngay: '10/05/2025',
    luot_xem: 980,
    noi_bat: false,
  },
  {
    id: 3,
    tieu_de: 'Trung tâm Sao Việt khai giảng lớp B2 tháng 6/2025 — Ưu đãi học phí 10%',
    tom_tat: 'Trung tâm dạy lái xe Sao Việt thông báo khai giảng lớp B2 số sàn vào đầu tháng 6/2025. Học viên đăng ký trước ngày 25/05 được giảm 10% học phí.',
    hinh: '/chungnhan1.jpg',
    danh_muc: 'Thông báo',
    ngay: '08/05/2025',
    luot_xem: 756,
    noi_bat: false,
  },
  {
    id: 4,
    tieu_de: 'Kinh nghiệm vượt qua bài thi sa hình lần đầu — Bí quyết từ giảng viên',
    tom_tat: 'Sa hình là bài thi khiến nhiều học viên lo lắng nhất. Các giảng viên giàu kinh nghiệm tại Sao Việt chia sẻ những mẹo thực tế giúp bạn vượt qua ngay lần đầu.',
    hinh: '/chungnhan2.jpg',
    danh_muc: 'Kinh nghiệm',
    ngay: '05/05/2025',
    luot_xem: 1560,
    noi_bat: false,
  },
  {
    id: 5,
    tieu_de: 'Phân biệt bằng lái B1 và B2 — Nên học hạng nào phù hợp?',
    tom_tat: 'Nhiều người băn khoăn giữa việc học B1 hay B2. Bài viết phân tích rõ sự khác biệt, điều kiện thi và lợi ích của từng hạng bằng để bạn đưa ra lựa chọn đúng đắn.',
    hinh: '/chungnhan3.jpg',
    danh_muc: 'Tư vấn',
    ngay: '01/05/2025',
    luot_xem: 890,
    noi_bat: false,
  },
  {
    id: 6,
    tieu_de: 'Lịch sát hạch lái xe tháng 6/2025 tại Sở GTVT TP.HCM',
    tom_tat: 'Sở Giao thông Vận tải TP.HCM vừa công bố lịch sát hạch lái xe tháng 6/2025. Học viên đủ điều kiện cần đăng ký trước hạn để được xếp lịch thi.',
    hinh: '/gioithieu.png',
    danh_muc: 'Thông báo',
    ngay: '28/04/2025',
    luot_xem: 1120,
    noi_bat: false,
  },
]

const danhMuc = [
  { ten: 'Tất cả', so_luong: danhSachTin.length },
  { ten: 'Thông báo', so_luong: 2 },
  { ten: 'Hướng dẫn', so_luong: 1 },
  { ten: 'Kinh nghiệm', so_luong: 1 },
  { ten: 'Quy định pháp luật', so_luong: 1 },
  { ten: 'Tư vấn', so_luong: 1 },
]

const baiDocNhieu = danhSachTin
  .slice()
  .sort((a, b) => b.luot_xem - a.luot_xem)
  .slice(0, 4)

const tags = ['Bằng lái B2', 'Bằng lái A1', 'Sa hình', 'Đường trường', 'Học phí', 'Khai giảng', 'Quy định mới', 'Kinh nghiệm lái xe']

// ── Component ─────────────────────────────────────────────────────────────────
const TinTuc = () => {
  const [danhMucChon, setDanhMucChon] = useState('Tất cả')
  const [trang, setTrang] = useState(1)

  const tinNoiBat = danhSachTin.find(t => t.noi_bat) || danhSachTin[0]
  const tinCon = danhSachTin.filter(t => t.id !== tinNoiBat.id)

  const tinLoc = danhMucChon === 'Tất cả'
    ? tinCon
    : tinCon.filter(t => t.danh_muc === danhMucChon)

  const soTrangHienThi = 4
  const tinHienThi = tinLoc.slice(0, soTrangHienThi)

  return (
    <>
      {/* Header */}
      <div className="tintuc-header">
        <div className="container">
          <h1>Tin Tức & Thông Báo</h1>
          <p>Cập nhật thông tin mới nhất về đào tạo lái xe, quy định pháp luật và hoạt động của trung tâm</p>
        </div>
      </div>

      <div className="container">
        <div className="tintuc-layout">

          {/* ── Cột chính ── */}
          <div>
            {/* Bài nổi bật */}
            <div className="tintuc-featured">
              <img src={tinNoiBat.hinh} alt={tinNoiBat.tieu_de} />
              <div className="tintuc-featured-overlay">
                <span className="badge">{tinNoiBat.danh_muc}</span>
                <h2>{tinNoiBat.tieu_de}</h2>
                <div className="meta">📅 {tinNoiBat.ngay} &nbsp;·&nbsp; 👁 {tinNoiBat.luot_xem.toLocaleString()} lượt xem</div>
              </div>
            </div>

            {/* Bộ lọc danh mục */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              {danhMuc.map(dm => (
                <button
                  key={dm.ten}
                  onClick={() => { setDanhMucChon(dm.ten); setTrang(1) }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: danhMucChon === dm.ten ? '#0066cc' : '#ddd',
                    background: danhMucChon === dm.ten ? '#0066cc' : '#fff',
                    color: danhMucChon === dm.ten ? '#fff' : '#555',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {dm.ten} ({dm.so_luong})
                </button>
              ))}
            </div>

            {/* Tiêu đề section */}
            <div className="tintuc-section-title">Tin mới nhất</div>

            {/* Grid bài viết */}
            <div className="tintuc-grid">
              {tinHienThi.map(tin => (
                <div className="tintuc-card" key={tin.id}>
                  <img src={tin.hinh} alt={tin.tieu_de} />
                  <div className="tintuc-card-body">
                    <span className="badge">{tin.danh_muc}</span>
                    <h3>{tin.tieu_de}</h3>
                    <p>{tin.tom_tat}</p>
                    <div className="meta">
                      <span>📅 {tin.ngay}</span>
                      <span>👁 {tin.luot_xem.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            <div className="tintuc-pagination">
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  className={trang === p ? 'active' : ''}
                  onClick={() => setTrang(p)}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => setTrang(t => Math.min(t + 1, 3))}>›</button>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="tintuc-sidebar">

            {/* Danh mục */}
            <div className="sidebar-box">
              <div className="sidebar-box-title">Danh mục</div>
              <div className="sidebar-box-body">
                <ul className="sidebar-categories">
                  {danhMuc.map(dm => (
                    <li key={dm.ten} onClick={() => setDanhMucChon(dm.ten)}>
                      <span>{dm.ten}</span>
                      <span className="count">{dm.so_luong}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bài đọc nhiều */}
            <div className="sidebar-box">
              <div className="sidebar-box-title">Đọc nhiều nhất</div>
              <div className="sidebar-box-body">
                <div className="sidebar-popular">
                  {baiDocNhieu.map(tin => (
                    <div className="sidebar-popular-item" key={tin.id}>
                      <img src={tin.hinh} alt={tin.tieu_de} />
                      <div>
                        <h5>{tin.tieu_de}</h5>
                        <div className="meta">👁 {tin.luot_xem.toLocaleString()} lượt xem</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="sidebar-box">
              <div className="sidebar-box-title">Từ khóa</div>
              <div className="sidebar-box-body">
                <div className="sidebar-tags">
                  {tags.map(tag => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA đăng ký */}
            <div className="sidebar-box" style={{ background: 'linear-gradient(135deg, #0066cc, #004499)', color: '#fff' }}>
              <div className="sidebar-box-body" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🚗</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sẵn sàng học lái xe?</h3>
                <p style={{ fontSize: 13, opacity: 0.88, marginBottom: 16, lineHeight: 1.6 }}>
                  Đăng ký tư vấn miễn phí ngay hôm nay để được hỗ trợ chọn khóa học phù hợp.
                </p>
                <Link
                  to="/dang-ky"
                  style={{
                    display: 'inline-block',
                    background: '#fff',
                    color: '#0066cc',
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '10px 24px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </>
  )
}

export default TinTuc
