import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './KhoaHoc.css'

const BANG_IMG   = { B1:'/xe1.png', B2:'/xe2.png', C:'/xe3.png', C1:'/xe3.png', A1:'/xe1.png', A2:'/xe1.png' }
const BANG_COLOR = {
  B1:'linear-gradient(90deg,#0066cc,#0099ff)',
  B2:'linear-gradient(90deg,#00b09b,#96c93d)',
  C: 'linear-gradient(90deg,#1565c0,#283593)',
  C1:'linear-gradient(90deg,#1565c0,#283593)',
  A1:'linear-gradient(90deg,#f7971e,#ffd200)',
  A2:'linear-gradient(90deg,#f7971e,#ffd200)',
}

const KhoaHoc = () => {
  const [list, setList]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/khoa-hoc')
      .then(res => { if (res.data.success) setList(res.data.data) })
      .finally(() => setLoading(false))
  }, [])

  const displayList = list.length > 0 ? list : [
    { id:1, ten_khoa:'Bằng Ô Tô Hạng B Số Tự Động', loai_bang:'B1', hoc_phi:18600000, thoi_gian_ngay:65, so_buoi_ly_thuyet_toi_thieu:18, so_km_toi_thieu:660 },
    { id:2, ten_khoa:'Bằng Ô Tô Hạng B Số Sàn',     loai_bang:'B2', hoc_phi:18600000, thoi_gian_ngay:75, so_buoi_ly_thuyet_toi_thieu:20, so_km_toi_thieu:810 },
    { id:3, ten_khoa:'Bằng Ô Tô Hạng C1 Xe Tải',    loai_bang:'C1', hoc_phi:20200000, thoi_gian_ngay:78, so_buoi_ly_thuyet_toi_thieu:25, so_km_toi_thieu:1000 },
    { id:4, ten_khoa:'Bằng Lái Xe Hạng A1',          loai_bang:'A1', hoc_phi:1200000,  thoi_gian_ngay:30, so_buoi_ly_thuyet_toi_thieu:8,  so_km_toi_thieu:50 },
  ]

  return (
    <div className="khoahoc-page">
      <div className="khoahoc-hero">
        <div className="container">
          <h1>Các Khóa Đào Tạo Lái Xe</h1>
          <p>Tại Trung Tâm SAO VIỆT — Chuyên nghiệp, uy tín, học phí trọn gói</p>
        </div>
      </div>

      <div className="container khoahoc-content">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /></div>
        ) : (
          <div className="kh-list-grid">
            {displayList.map(kh => (
              <div key={kh.id} className="kh-detail-card">
                <div className="kh-detail-img">
                  <img src={BANG_IMG[kh.loai_bang] || '/xe2.png'} alt={kh.ten_khoa} />
                </div>
                <div className="kh-detail-body">
                  <div className="kh-detail-header" style={{ background: BANG_COLOR[kh.loai_bang] || BANG_COLOR.B2 }}>
                    <h3>{kh.ten_khoa}</h3>
                  </div>
                  <div className="kh-detail-price">
                    <span className="price-old">{Math.round(Number(kh.hoc_phi)*1.1).toLocaleString('vi-VN')}</span>
                    <span className="price-new">{Number(kh.hoc_phi).toLocaleString('vi-VN')}</span>
                    <span className="price-note">Hồ sơ trọn gói không phát sinh</span>
                  </div>
                  <ul className="kh-detail-info">
                    {[
                      'Độ tuổi đăng ký: >= 18',
                      'Khai giảng: đúng khóa',
                      `Thời gian học: ${kh.thoi_gian_ngay || 75} ngày đào tạo`,
                      'Thời gian học: linh hoạt',
                      `Lý thuyết tối thiểu: ${kh.so_buoi_ly_thuyet_toi_thieu || 20} buổi`,
                      `Km thực hành tối thiểu: ${kh.so_km_toi_thieu || 810} km`,
                    ].map((item, i) => (
                      <li key={i}><span className="kh-check-icon">✓</span><span>{item}</span></li>
                    ))}
                  </ul>
                  <div className="kh-detail-footer">
                    <Link to="/dang-ky" className="btn-dang-ky-full">ĐĂNG KÝ NGAY</Link>
                    <p>📞 Hotline: <strong>0934 057 333</strong> 🔥</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KhoaHoc
