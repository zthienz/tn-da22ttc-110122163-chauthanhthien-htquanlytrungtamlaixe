import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useUser } from '../../context/UserContext'
import './Dashboard.css'

const StatCard = ({ icon, label, value, sub, color, to }) => (
  <Link to={to || '#'} className="stat-card" style={{ '--card-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
    <div className="stat-arrow">→</div>
  </Link>
)

const Dashboard = () => {
  const { token, hoSo, userInfo, backendUrl } = useUser()
  const [summary, setSummary] = useState(null)
  const [lichHomNay, setLichHomNay] = useState([])

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }

    axios.get(`${backendUrl}/api/hoc-vien/summary`, { headers })
      .then(res => { if (res.data.success) setSummary(res.data.data) })
      .catch(() => {})

    axios.get(`${backendUrl}/api/hoc-vien/lich-hoc`, {
      headers,
      params: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
    })
      .then(res => { if (res.data.success) setLichHomNay(res.data.data.slice(0, 3)) })
      .catch(() => {})
  }, [token])

  const trangThaiMap = {
    cho_dong_hoc_phi:      { text: 'Chờ đóng học phí',    color: '#f59e0b', bg: '#fef3c7' },
    chuan_bi_hoc:          { text: 'Chuẩn bị học',         color: '#3b82f6', bg: '#dbeafe' },
    cho_mo_lop:            { text: 'Chờ mở lớp',           color: '#3b82f6', bg: '#dbeafe' },
    dang_hoc:              { text: 'Đang học',              color: '#10b981', bg: '#d1fae5' },
    du_dieu_kien_thi_tn:   { text: 'Đủ điều kiện thi TN',  color: '#6366f1', bg: '#ede9fe' },
    chuan_bi_thi:          { text: 'Chuẩn bị thi',         color: '#f59e0b', bg: '#fef3c7' },
    hoan_thanh_tn:         { text: 'Hoàn thành tốt nghiệp',color: '#10b981', bg: '#d1fae5' },
    du_dieu_kien_sat_hanh: { text: 'Chờ thi sát hạch',     color: '#6366f1', bg: '#ede9fe' },
    dang_thi_sat_hanh:     { text: 'Đang thi sát hạch',    color: '#f59e0b', bg: '#fef3c7' },
    dau_sat_hanh:          { text: 'Đậu sát hạch',          color: '#10b981', bg: '#d1fae5' },
    da_cap_bang:           { text: 'Đã cấp bằng lái',      color: '#10b981', bg: '#d1fae5' },
  }
  const ts = trangThaiMap[hoSo?.trang_thai] || { text: '—', color: '#6b7280', bg: '#f3f4f6' }

  return (
    <div className="dashboard">
      {/* ── Chào mừng ── */}
      <div className="dash-welcome">
        <div className="dash-welcome-left">
          <div className="dash-avatar">
            {hoSo?.anh_the
              ? <img src={`/uploads/${hoSo.anh_the}`} alt="avatar" />
              : <span>{(hoSo?.ho_ten || userInfo?.ho_ten || 'H').charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <h2>Xin chào, {hoSo?.ho_ten || userInfo?.ho_ten || 'Học Viên'}! 👋</h2>
            <p>Chào mừng bạn đến với cổng thông tin học viên Trung Tâm Lái Xe Sao Việt</p>
            <div className="dash-status-badge" style={{ background: ts.bg, color: ts.color }}>
              <span className="dash-status-dot" style={{ background: ts.color }} />
              {ts.text}
            </div>
          </div>
        </div>
      </div>

      {/* ── Thống kê nhanh ── */}
      <div className="stat-grid">
        <StatCard icon="📅" label="Lịch học hôm nay"   value={`${summary?.lichHocHomNay ?? 0} buổi`}  color="#3b82f6" to="/lich-hoc" />
        <StatCard icon="📚" label="Buổi học còn lại"   value={`${summary?.buoiConLai ?? 0} buổi`}     color="#8b5cf6" to="/tien-do" />
        <StatCard icon="🚗" label="Km đã thực hành"    value={`${summary?.kmDaChay ?? 0} km`}          color="#10b981" to="/tien-do" />
        <StatCard icon="🏆" label="Kết quả thi gần nhất" value={summary?.ketQuaThi ?? '—'}             color="#f59e0b" to="/ket-qua-thi" />
        <StatCard icon="💳" label="Trạng thái học phí" value={summary?.hocPhi ?? '—'}                  color="#ef4444" to="/hoc-phi" />
        <StatCard icon="📊" label="Tiến độ lý thuyết"  value={`${summary?.phanTramLyThuyet ?? 0}%`}   color="#06b6d4" to="/tien-do" />
      </div>

      {/* ── Lịch học hôm nay ── */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>📅 Lịch Học Hôm Nay</h3>
          <Link to="/lich-hoc" className="dash-see-all">Xem tất cả →</Link>
        </div>
        {lichHomNay.length === 0 ? (
          <div className="dash-empty">
            <span>🎉</span>
            <p>Hôm nay bạn không có lịch học. Hãy nghỉ ngơi!</p>
          </div>
        ) : (
          <div className="dash-lich-list">
            {lichHomNay.map(lh => (
              <div key={lh.id} className={`dash-lich-item ${lh.loai_buoi}`}>
                <div className="dli-time">
                  <span>{lh.gio_bat_dau?.slice(0,5)}</span>
                  <span className="dli-sep">—</span>
                  <span>{lh.gio_ket_thuc?.slice(0,5)}</span>
                </div>
                <div className="dli-info">
                  <p className="dli-title">
                    {lh.loai_buoi === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}
                  </p>
                  <p className="dli-lop">{lh.lop_hoc?.ten_lop}</p>
                  {lh.dia_diem && <p className="dli-dia">📍 {lh.dia_diem}</p>}
                </div>
                <span className={`badge ${lh.loai_buoi === 'ly_thuyet' ? 'badge-info' : 'badge-success'}`}>
                  {lh.loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Truy cập nhanh ── */}
      <div className="dash-section">
        <h3>⚡ Truy Cập Nhanh</h3>
        <div className="quick-grid">
          {[
            { to:'/lich-hoc',    icon:'📅', label:'Lịch Học',         desc:'Xem lịch học theo tuần' },
            { to:'/tien-do',     icon:'📊', label:'Tiến Độ',          desc:'Lý thuyết & thực hành' },
            { to:'/ket-qua-thi', icon:'🏆', label:'Kết Quả Thi',      desc:'Điểm thi & trạng thái' },
            { to:'/hoc-phi',     icon:'💳', label:'Học Phí',          desc:'Thanh toán & lịch sử' },
            { to:'/ho-so',       icon:'👤', label:'Hồ Sơ',            desc:'Thông tin cá nhân' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="quick-card">
              <span className="qc-icon">{item.icon}</span>
              <p className="qc-label">{item.label}</p>
              <p className="qc-desc">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
