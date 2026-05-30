import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './KhoaHoc.css'

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

const BANG_DETAIL = {
  A1: { tuoi: '>= 16 tuổi', loaiXe: 'Xe máy dưới 125cc' },
  A:  { tuoi: '>= 18 tuổi', loaiXe: 'Xe máy phân khối lớn trên 125cc' },
  B1: { tuoi: '>= 18 tuổi', loaiXe: 'Ô tô số tự động dưới 9 chỗ' },
  B2: { tuoi: '>= 18 tuổi', loaiXe: 'Ô tô số sàn dưới 9 chỗ (Vios, Altis)' },
  C1: { tuoi: '>= 21 tuổi', loaiXe: 'Xe tải nhẹ 3.5 - 7.5 tấn' },
  C:  { tuoi: '>= 21 tuổi', loaiXe: 'Xe tải nặng trên 7.5 tấn' },
  D:  { tuoi: '>= 21 tuổi', loaiXe: 'Xe khách 9 - 30 chỗ ngồi' },
  E:  { tuoi: '>= 24 tuổi', loaiXe: 'Xe khách trên 30 chỗ ngồi' },
  CE: { tuoi: '>= 21 tuổi', loaiXe: 'Xe đầu kéo, xe container' },
}

const BANG_ORDER = ['A1','A','B1','B2','C1','C','D','E','CE']

const KhoaHoc = () => {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/khoa-hoc')
      .then(res => { if (res.data.success) setList(res.data.data) })
      .finally(() => setLoading(false))
  }, [])

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

  const fallback = [
    { id:1, ten_khoa:'Bằng lái xe hạng A1',           loai_bang:'A1', hoc_phi:2000000,  so_buoi_ly_thuyet_toi_thieu:8,  so_km_toi_thieu:50 },
    { id:2, ten_khoa:'Bằng lái xe hạng A (>125cc)',   loai_bang:'A',  hoc_phi:3000000,  so_buoi_ly_thuyet_toi_thieu:10, so_km_toi_thieu:80 },
    { id:3, ten_khoa:'Bằng lái xe hạng B1',           loai_bang:'B1', hoc_phi:15000000, so_buoi_ly_thuyet_toi_thieu:18, so_km_toi_thieu:660 },
    { id:4, ten_khoa:'Bằng lái xe hạng B2',           loai_bang:'B2', hoc_phi:18000000, so_buoi_ly_thuyet_toi_thieu:20, so_km_toi_thieu:810 },
    { id:5, ten_khoa:'Bằng lái xe hạng C1 (tải nhẹ)', loai_bang:'C1', hoc_phi:22000000, so_buoi_ly_thuyet_toi_thieu:25, so_km_toi_thieu:1000 },
    { id:6, ten_khoa:'Bằng lái xe hạng C (tải nặng)', loai_bang:'C',  hoc_phi:26000000, so_buoi_ly_thuyet_toi_thieu:30, so_km_toi_thieu:1200 },
    { id:7, ten_khoa:'Nâng hạng bằng lái xe hạng D',  loai_bang:'D',  hoc_phi:10000000, so_buoi_ly_thuyet_toi_thieu:20, so_km_toi_thieu:800 },
    { id:8, ten_khoa:'Nâng hạng bằng lái xe hạng E',  loai_bang:'E',  hoc_phi:11000000, so_buoi_ly_thuyet_toi_thieu:20, so_km_toi_thieu:800 },
    { id:9, ten_khoa:'Nâng hạng bằng lái xe hạng CE', loai_bang:'CE', hoc_phi:19000000, so_buoi_ly_thuyet_toi_thieu:25, so_km_toi_thieu:1000 },
  ]

  // API đã trả về đúng loại bằng lái (không có khóa học theo tháng)
  let displayList
  if (list.length > 0) {
    displayList = list.map(kh => ({ ...kh }))
  } else {
    displayList = fallback
  }

  displayList = [...displayList].sort((a, b) =>
    BANG_ORDER.indexOf(a.loai_bang) - BANG_ORDER.indexOf(b.loai_bang)
  )

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
            {displayList.map(kh => {
              const detail = BANG_DETAIL[kh.loai_bang] || { tuoi: '>= 18 tuổi', loaiXe: 'Ô tô' }
              const slug   = kh.loai_bang?.toLowerCase()
              return (
                <div key={kh.id} className="kh-detail-card">
                  <div className="kh-detail-img">
                    <img src={BANG_IMG[kh.loai_bang] || '/bang-lai-b1-2.png'} alt={kh.ten_khoa} />
                  </div>
                  <div className="kh-detail-body">
                    <div className="kh-detail-header" style={{ background: BANG_COLOR[kh.loai_bang] || BANG_COLOR.B2 }}>
                      <h3>{kh.ten_khoa}</h3>
                    </div>
                    <div className="kh-detail-price">
                      <span className="price-main">{Number(kh.hoc_phi).toLocaleString('vi-VN')} đ</span>
                      <span className="price-note">Hồ sơ trọn gói không phát sinh</span>
                    </div>
                    <ul className="kh-detail-info">
                      {[
                        `Độ tuổi đăng ký: ${detail.tuoi}`,
                        'Khai giảng: đúng khóa',
                        `Thời gian học: ${kh.thoi_gian_ngay || 75} ngày đào tạo`,
                        'Thời gian học: linh hoạt',
                        `Loại xe: ${detail.loaiXe}`,
                        `Lý thuyết tối thiểu: ${kh.so_buoi_ly_thuyet_toi_thieu || 20} buổi`,
                        `Km thực hành tối thiểu: ${kh.so_km_toi_thieu || 810} km`,
                      ].map((item, i) => (
                        <li key={i}>
                          <span className="kh-check-icon">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="kh-detail-footer">
                      <Link to={`/khoa-hoc/${slug}`} className="btn-dang-ky-full">XEM CHI TIẾT</Link>
                      <p>📞 Hotline: <strong>0934 057 333</strong></p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default KhoaHoc
