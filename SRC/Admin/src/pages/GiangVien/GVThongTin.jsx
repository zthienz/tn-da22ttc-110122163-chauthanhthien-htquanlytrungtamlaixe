import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAdmin } from '../../context/AdminContext'
import './GVThongTin.css'

const CM_MAP = { ly_thuyet:'📖 Lý thuyết', thuc_hanh:'🚗 Thực hành', ca_hai:'📖🚗 Cả hai' }

const GVThongTin = () => {
  const { token, adminInfo, backendUrl } = useAdmin()
  const [giangVien, setGiangVien] = useState(null)
  const [loading, setLoading]     = useState(true)
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/thong-tin`, { headers })
      .then(res => { if (res.data.success) setGiangVien(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner"/></div>

  const anhUrl = giangVien?.anh_dai_dien
    ? `/uploads/${giangVien.anh_dai_dien}`
    : null

  return (
    <div className="gv-thongtin">
      <div className="page-header">
        <div><h2>👤 Thông Tin Cá Nhân</h2><p>Thông tin tài khoản giảng viên của bạn</p></div>
      </div>

      <div className="gvtt-grid">
        {/* Card trái — ảnh + tên */}
        <div className="gvtt-profile-card">
          <div className="gvtt-anh-wrap">
            {anhUrl ? (
              <img src={anhUrl} alt={adminInfo?.ho_ten} className="gvtt-anh"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            ) : null}
            <div className="gvtt-anh-fallback" style={{display: anhUrl ? 'none' : 'flex'}}>
              {adminInfo?.ho_ten?.charAt(0).toUpperCase() || 'G'}
            </div>
          </div>
          <h3 className="gvtt-name">{adminInfo?.ho_ten}</h3>
          <p className="gvtt-email">{adminInfo?.email}</p>
          <span className={`badge ${giangVien?.chuyen_mon === 'thuc_hanh' ? 'badge-success' : 'badge-info'}`} style={{marginTop:8,fontSize:13}}>
            {CM_MAP[giangVien?.chuyen_mon] || '—'}
          </span>
          <div className="gvtt-stats">
            <div className="gvtt-stat">
              <span>{giangVien?.nam_kinh_nghiem || 0}</span>
              <p>Năm KN</p>
            </div>
            <div className="gvtt-stat">
              <span>{giangVien?.lop_count || 0}</span>
              <p>Lớp dạy</p>
            </div>
          </div>
        </div>

        {/* Card phải — chi tiết */}
        <div className="card">
          <div className="card-header"><h3>📋 Chi Tiết Thông Tin</h3></div>
          <div className="card-body">
            {[
              { icon:'👤', label:'Họ và tên',       value: adminInfo?.ho_ten },
              { icon:'✉️', label:'Email đăng nhập', value: adminInfo?.email },
              { icon:'📞', label:'Số điện thoại',   value: adminInfo?.so_dien_thoai || '—' },
              { icon:'🎓', label:'Bằng cấp',         value: giangVien?.bang_cap || '—' },
              { icon:'⭐', label:'Kinh nghiệm',      value: `${giangVien?.nam_kinh_nghiem || 0} năm` },
              { icon:'📚', label:'Chuyên môn',       value: CM_MAP[giangVien?.chuyen_mon] || '—' },
              { icon:'📝', label:'Ghi chú',          value: giangVien?.ghi_chu || '—' },
            ].map((item, i) => (
              <div key={i} className="gvtt-info-row">
                <span className="gvtt-info-icon">{item.icon}</span>
                <div>
                  <p className="gvtt-info-label">{item.label}</p>
                  <p className="gvtt-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GVThongTin
