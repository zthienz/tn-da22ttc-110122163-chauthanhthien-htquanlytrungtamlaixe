import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../context/UserContext'
import './LichHoc.css'

const DAYS = ['CN','T2','T3','T4','T5','T6','T7']
const MONTHS = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12']

const getWeekDates = (baseDate) => {
  const d = new Date(baseDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return dt
  })
}

const fmt = d => d.toISOString().split('T')[0]

const LichHoc = () => {
  const { token, hoSo, backendUrl } = useUser()
  const [lichHoc, setLichHoc]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [baseDate, setBaseDate]     = useState(new Date())
  const [view, setView]             = useState('week') // 'week' | 'list'
  const [giangVien, setGiangVien]   = useState(null)

  const weekDates = getWeekDates(baseDate)
  const fromDate  = fmt(weekDates[0])
  const toDate    = fmt(weekDates[6])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    axios.get(`${backendUrl}/api/hoc-vien/lich-hoc`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { from: fromDate, to: toDate }
    })
      .then(res => { if (res.data.success) setLichHoc(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, fromDate, toDate])

  // Lấy thông tin giảng viên từ lớp học
  useEffect(() => {
    if (!token || !hoSo?.hoc_vien_lop?.lop_hoc_id) return
    axios.get(`${backendUrl}/api/hoc-vien/giang-vien`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setGiangVien(res.data.data) })
      .catch(() => {})
  }, [token, hoSo])

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate()-7); setBaseDate(d) }
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate()+7); setBaseDate(d) }
  const goToday  = () => setBaseDate(new Date())

  const getLichByDate = (date) => lichHoc.filter(lh => lh.ngay_hoc === fmt(date))
  const isToday = (date) => fmt(date) === fmt(new Date())

  return (
    <div className="lich-hoc-page">
      <div className="page-header">
        <div>
          <h2>📅 Lịch Học</h2>
          <p>Theo dõi lịch học lý thuyết và thực hành của bạn</p>
        </div>
        <div className="lh-view-toggle">
          <button className={view==='week'?'active':''} onClick={()=>setView('week')}>📆 Tuần</button>
          <button className={view==='list'?'active':''} onClick={()=>setView('list')}>📋 Danh sách</button>
        </div>
      </div>

      {/* Giảng viên */}
      {giangVien && (
        <div className="gv-cards">
          {giangVien.ly_thuyet && <GiangVienCard gv={giangVien.ly_thuyet} type="Lý thuyết" backendUrl={backendUrl} />}
          {giangVien.thuc_hanh && <GiangVienCard gv={giangVien.thuc_hanh} type="Thực hành" backendUrl={backendUrl} />}
        </div>
      )}

      {/* Điều hướng tuần */}
      <div className="lh-nav">
        <button onClick={prevWeek} className="lh-nav-btn">‹ Tuần trước</button>
        <div className="lh-nav-center">
          <span className="lh-week-label">
            {weekDates[0].getDate()} {MONTHS[weekDates[0].getMonth()]} —{' '}
            {weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
          </span>
          <button onClick={goToday} className="lh-today-btn">Hôm nay</button>
        </div>
        <button onClick={nextWeek} className="lh-nav-btn">Tuần sau ›</button>
      </div>

      {loading ? (
        <div className="lh-loading"><div className="spinner" /></div>
      ) : view === 'week' ? (
        /* ── Lịch tuần ── */
        <div className="lh-week-grid">
          {weekDates.map((date, i) => {
            const items = getLichByDate(date)
            return (
              <div key={i} className={`lh-day-col ${isToday(date) ? 'today' : ''}`}>
                <div className="lh-day-header">
                  <span className="lh-day-name">{DAYS[date.getDay()]}</span>
                  <span className={`lh-day-num ${isToday(date) ? 'today-num' : ''}`}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="lh-day-body">
                  {items.length === 0
                    ? <div className="lh-no-class" />
                    : items.map(lh => (
                        <div key={lh.id} className={`lh-event ${lh.loai_buoi}`}>
                          <p className="lhe-time">{lh.gio_bat_dau?.slice(0,5)} – {lh.gio_ket_thuc?.slice(0,5)}</p>
                          <p className="lhe-type">{lh.loai_buoi === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}</p>
                          {lh.dia_diem && <p className="lhe-dia">📍 {lh.dia_diem}</p>}
                        </div>
                      ))
                  }
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Danh sách ── */
        <div className="lh-list">
          {lichHoc.length === 0 ? (
            <div className="lh-empty">
              <span>📅</span>
              <p>Không có lịch học trong tuần này</p>
            </div>
          ) : (
            lichHoc.map(lh => (
              <div key={lh.id} className={`lh-list-item ${lh.loai_buoi}`}>
                <div className="lli-date">
                  <span className="lli-day">{new Date(lh.ngay_hoc).getDate()}</span>
                  <span className="lli-month">{MONTHS[new Date(lh.ngay_hoc).getMonth()]}</span>
                </div>
                <div className="lli-info">
                  <p className="lli-title">
                    {lh.loai_buoi === 'ly_thuyet' ? '📖 Buổi Lý Thuyết' : '🚗 Buổi Thực Hành'}
                  </p>
                  <p className="lli-time">⏰ {lh.gio_bat_dau?.slice(0,5)} – {lh.gio_ket_thuc?.slice(0,5)}</p>
                  {lh.dia_diem && <p className="lli-dia">📍 {lh.dia_diem}</p>}
                  {lh.noi_dung && <p className="lli-nd">📝 {lh.noi_dung}</p>}
                </div>
                <span className={`badge ${lh.loai_buoi === 'ly_thuyet' ? 'badge-info' : 'badge-success'}`}>
                  {lh.loai_buoi === 'ly_thuyet' ? 'Lý thuyết' : 'Thực hành'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const GiangVienCard = ({ gv, type, backendUrl }) => (
  <div className="gv-card">
    <div className="gv-avatar">
      {gv.anh_dai_dien
        ? <img src={`${backendUrl}/storage/${gv.anh_dai_dien}`} alt={gv.ho_ten} />
        : <span>{gv.ho_ten?.charAt(0).toUpperCase()}</span>
      }
    </div>
    <div className="gv-info">
      <span className={`badge ${type === 'Lý thuyết' ? 'badge-info' : 'badge-success'}`} style={{marginBottom:'6px'}}>
        Giảng viên {type}
      </span>
      <p className="gv-name">{gv.ho_ten}</p>
      <p className="gv-detail">📞 {gv.so_dien_thoai || 'Chưa cập nhật'}</p>
      <p className="gv-detail">🎓 {gv.bang_cap || 'Chưa cập nhật'}</p>
      <p className="gv-detail">⭐ {gv.nam_kinh_nghiem} năm kinh nghiệm</p>
    </div>
  </div>
)

export default LichHoc
