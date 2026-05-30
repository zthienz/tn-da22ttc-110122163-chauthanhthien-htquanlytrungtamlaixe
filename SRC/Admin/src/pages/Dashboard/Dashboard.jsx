import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAdmin } from '../../context/AdminContext'
import './Dashboard.css'

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { token, backendUrl } = useAdmin()
  const [stats, setStats]           = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(true)
  const [actLoading, setActLoading] = useState(true)
  const [chartKy, setChartKy]           = useState('thang_nay')
  const [chartData, setChartData]       = useState([])
  const [chartLoading, setChartLoading] = useState(false)
  const [hvChartData, setHvChartData]   = useState([])

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setStats(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))

    axios.get(`${backendUrl}/api/admin/hoat-dong-gan-day`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setActivities(res.data.data) })
      .catch(() => {})
      .finally(() => setActLoading(false))

    // Grouped chart: học viên đăng ký mới vs hoàn thành 6 tháng gần nhất
    axios.get(`${backendUrl}/api/admin/chart-hoc-vien`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setHvChartData(res.data.data) })
      .catch(() => {})
  }, [token])

  // Fetch chart khi đổi kỳ
  useEffect(() => {
    setChartLoading(true)
    axios.get(`${backendUrl}/api/admin/chart-doanh-thu`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ky: chartKy }
    })
      .then(res => { if (res.data.success) setChartData(res.data.data) })
      .catch(() => {})
      .finally(() => setChartLoading(false))
  }, [chartKy, token])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  const s = stats?.stats || {}
  const trangThaiData = [
    { name: 'Chờ đóng HP', value: s.choMoLop || 0,  color: '#f59e0b' },
    { name: 'Đang học',    value: s.dangHoc  || 0,  color: '#10b981' },
    { name: 'Tổng hồ sơ', value: s.tongHoSo || 0,  color: '#3b82f6' },
  ]

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>📊 Quản Trị Hệ Thống</h2>
          <p>Tổng quan hoạt động của Trung Tâm Lái Xe Sao Việt</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stat-grid">
        {[
          { icon:'📋', label:'Tổng Hồ Sơ',      value: s.tongHoSo  || 0, color:'#3b82f6', to:'/ho-so' },
          { icon:'⏳', label:'Chờ Mở Lớp',       value: s.choMoLop  || 0, color:'#f59e0b', to:'/ho-so' },
          { icon:'📚', label:'Đang Học',          value: s.dangHoc   || 0, color:'#10b981', to:'/lop-hoc' },
          { icon:'🏫', label:'Khóa Học',          value: s.khoaHoc   || 0, color:'#8b5cf6', to:'/khoa-hoc' },
          { icon:'📅', label:'Lịch Học Hôm Nay', value: s.lichHoc   || 0, color:'#06b6d4', to:'/lich-hoc' },
          { icon:'💰', label:'Doanh Thu Tháng',  value: `${Number(s.doanhThu||0).toLocaleString('vi-VN')}đ`, color:'#ef4444', to:'/ho-so' },
        ].map((card, i) => (
          <Link key={i} to={card.to} className="dash-stat-card" style={{'--c': card.color}}>
            <div className="dsc-icon">{card.icon}</div>
            <div className="dsc-body">
              <p>{card.label}</p>
              <h3>{card.value}</h3>
            </div>
            <span className="dsc-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Hàng 1: Biểu đồ doanh thu + Hoạt động gần đây */}
      <div className="dash-main-row">

        {/* Biểu đồ doanh thu */}
        <div className="card dash-chart-card">
          <div className="card-header">
            <h3>📈 Biểu Đồ Doanh Thu</h3>
            <select
              className="dash-chart-select"
              value={chartKy}
              onChange={e => setChartKy(e.target.value)}
            >
              <option value="thang_nay">Tháng này</option>
              <option value="thang">12 Tháng</option>
              <option value="quy">Theo Quý</option>
              <option value="nam">5 Năm</option>
            </select>
          </div>
          <div className="card-body" style={{position:'relative'}}>
            {chartLoading && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.7)',zIndex:2}}>
                <div className="spinner"/>
              </div>
            )}
            <ResponsiveContainer width="100%" height={365}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0d47a1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0d47a1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v > 0 ? `${(v/1000000).toFixed(1)}M` : '0'} />
                <Tooltip formatter={v => `${Number(v).toLocaleString('vi-VN')}đ`} labelStyle={{fontWeight:600}} />
                <Area type="monotone" dataKey="revenue" stroke="#0d47a1" strokeWidth={2.5}
                  fill="url(#colorRevenue)" dot={{ r: 4, fill: '#0d47a1', strokeWidth: 0 }}
                  activeDot={{ r: 6 }} name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="card dash-activity-card">
          <div className="card-header">
            <h3>🔔 Hoạt Động Gần Đây</h3>
            <button className="btn btn-outline btn-sm" onClick={() => {
              setActLoading(true)
              axios.get(`${backendUrl}/api/admin/hoat-dong-gan-day`, {
                headers: { Authorization: `Bearer ${token}` }
              }).then(res => { if (res.data.success) setActivities(res.data.data) })
                .catch(() => {}).finally(() => setActLoading(false))
            }}>🔄 Làm mới</button>
          </div>
          <div className="card-body dash-activity-body">
            {actLoading ? (
              <div className="loading-wrap"><div className="spinner" /></div>
            ) : activities.length === 0 ? (
              <div className="empty-state" style={{padding:'32px'}}>
                <span>📭</span><p>Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className="dash-activity-list">
                {activities.map((act, i) => (
                  <Link key={i} to={act.link || '/'} className="dash-act-item">
                    <div className="dash-act-icon" style={{background: act.color + '18', color: act.color}}>
                      {act.icon}
                    </div>
                    <div className="dash-act-content">
                      <p className="dash-act-title">{act.title}</p>
                      <p className="dash-act-desc">{act.desc}</p>
                    </div>
                    <div className="dash-act-time" title={act.time_fmt}>
                      {act.time_human}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hàng 2: Grouped chart học viên + Donut trạng thái + Quick actions */}
      <div className="dash-bottom-row">

        {/* Grouped bar: học viên đăng ký mới vs hoàn thành */}
        <div className="card">
          <div className="card-header">
            <h3>👥 Học Viên 6 Tháng Gần Nhất</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hvChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={9} />
                <Bar dataKey="dang_ky"    name="Đăng ký mới"  fill="#1e3a5f" radius={[3,3,0,0]} />
                <Bar dataKey="hoan_thanh" name="Hoàn thành"   fill="#4e8fd4" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut: trạng thái học viên */}
        <div className="card dash-pie-card">
          <div className="card-header">
            <h3>🎯 Trạng Thái Học Viên</h3>
          </div>
          <div className="card-body dash-pie-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={trangThaiData} cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  dataKey="value" paddingAngle={4}
                  strokeWidth={0}>
                  {trangThaiData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card dash-quick-card-wrap">
          <div className="card-header"><h3>⚡ Thao Tác Nhanh</h3></div>
          <div className="card-body dash-quick-grid">
            {[
              { to:'/ho-so',      icon:'📋', label:'Quản lý hồ sơ',    desc:'Xem & xử lý hồ sơ học viên' },
              { to:'/lop-hoc',    icon:'🏫', label:'Mở lớp học',        desc:'Tạo & quản lý lớp học' },
              { to:'/lich-hoc',   icon:'📅', label:'Lên lịch học',      desc:'Tạo buổi học cho lớp' },
              { to:'/thi',        icon:'🏆', label:'Quản lý thi',       desc:'Lịch thi & kết quả' },
              { to:'/giang-vien', icon:'👨‍🏫', label:'Giảng viên',       desc:'Quản lý tài khoản GV' },
              { to:'/khoa-hoc',   icon:'📚', label:'Khóa học',          desc:'Cấu hình khóa học' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="dash-quick-card">
                <span>{item.icon}</span>
                <p>{item.label}</p>
                <small>{item.desc}</small>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── GIẢNG VIÊN DASHBOARD ─────────────────────────────────────────────────────
// ── Timetable helpers ──
const fmtD = d => { const s = typeof d === 'string' ? d : new Date(d).toISOString(); return s.slice(0,10) }
const DAY_SHORT_GV = ['CN','T2','T3','T4','T5','T6','T7']
const HS = 7, HE = 18, SM = 60, SH = 26
const TS = (HE - HS) * (60 / SM)
const t2s = t => { if (!t) return 0; const [h,m] = t.slice(0,5).split(':').map(Number); return (h-HS)*(60/SM)+m/SM }
const s2l = s => { const tot=HS*60+s*SM; return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}` }
const getWD = base => { const d=new Date(base),day=d.getDay(),mon=new Date(d); mon.setDate(d.getDate()-(day===0?6:day-1)); return Array.from({length:7},(_,i)=>{ const dt=new Date(mon); dt.setDate(mon.getDate()+i); return dt }) }
const LC = { ly_thuyet:{bg:'#dbeafe',border:'#3b82f6',text:'#1d4ed8'}, thuc_hanh:{bg:'#dcfce7',border:'#22c55e',text:'#15803d'} }

const GiangVienDashboard = () => {
  const { token, adminInfo, backendUrl } = useAdmin()
  const [lopHoc, setLopHoc]       = useState([])
  const [lichHomNay, setLichHomNay] = useState([])
  const [lichTuan, setLichTuan]   = useState([])
  const [base, setBase]           = useState(new Date())
  const headers = { Authorization: `Bearer ${token}` }

  const weekDates = getWD(base)
  const fromDate  = fmtD(weekDates[0])
  const toDate    = fmtD(weekDates[6])

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/lop-cua-toi`, { headers })
      .then(res => { if (res.data.success) setLopHoc(res.data.data) })
      .catch(() => {})
    axios.get(`${backendUrl}/api/giang-vien/lich-hom-nay`, { headers })
      .then(res => { if (res.data.success) setLichHomNay(res.data.data) })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/lich-theo-tuan`, { headers, params: { from: fromDate, to: toDate } })
      .then(res => { if (res.data.success) setLichTuan(res.data.data) })
      .catch(() => {})
  }, [fromDate, toDate, token])

  const getLichByDate = date => lichTuan.filter(l => l.ngay_hoc === fmtD(date))
  const isToday = date => fmtD(date) === fmtD(new Date())
  const getES = lh => { const top=t2s(lh.gio_bat_dau); const h=Math.max(t2s(lh.gio_ket_thuc)-top,1); return {top:`${top*SH}px`,height:`${h*SH-4}px`} }

  const tongHV = lopHoc.reduce((s,l) => s + (l.hoc_vien_count||0), 0)

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>👨‍🏫 Xin chào, {adminInfo?.ho_ten}! 👋</h2>
          <p>Đây là tổng quan hoạt động giảng dạy của bạn hôm nay.</p>
        </div>
        <span style={{fontSize:13,color:'#718096'}}>{new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
      </div>

      {/* Stats */}
      <div className="dash-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {[
          {icon:'🏫',label:'Lớp đang dạy',  value:lopHoc.filter(l=>l.trang_thai==='dang_hoc').length, c:'#3b82f6'},
          {icon:'👥',label:'Tổng học viên', value:tongHV, c:'#8b5cf6'},
          {icon:'📚',label:'Tổng lớp',      value:lopHoc.length, c:'#06b6d4'},
          {icon:'📅',label:'Buổi hôm nay',  value:lichHomNay.length, c:'#10b981'},
        ].map((s,i) => (
          <div key={i} className="dash-stat-card" style={{'--c':s.c}}>
            <div className="dsc-icon">{s.icon}</div>
            <div className="dsc-body"><p>{s.label}</p><h3>{s.value}</h3></div>
          </div>
        ))}
      </div>

      {/* Thời khóa biểu tuần */}
      <div className="card">
        <div className="card-header">
          <h3>🗓️ Thời Khóa Biểu Tuần</h3>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn-outline btn-sm" onClick={() => { const d=new Date(base); d.setDate(d.getDate()-7); setBase(d) }}>‹</button>
            <span style={{fontSize:13,fontWeight:600,minWidth:160,textAlign:'center'}}>
              {weekDates[0].getDate()}/{weekDates[0].getMonth()+1} — {weekDates[6].getDate()}/{weekDates[6].getMonth()+1}/{weekDates[6].getFullYear()}
            </span>
            <button className="btn btn-outline btn-sm" onClick={() => setBase(new Date())}>Hôm nay</button>
            <button className="btn btn-outline btn-sm" onClick={() => { const d=new Date(base); d.setDate(d.getDate()+7); setBase(d) }}>›</button>
            <Link to="/lich-day" className="btn btn-primary btn-sm">Xem đầy đủ →</Link>
          </div>
        </div>
        <div className="card-body" style={{padding:0,overflowX:'auto'}}>
          <div style={{minWidth:700}}>
            {/* Header */}
            <div style={{display:'grid',gridTemplateColumns:'48px repeat(7,1fr)',borderBottom:'2px solid #e2e8f0',background:'#f8fafc'}}>
              <div style={{padding:'8px 4px'}}/>
              {weekDates.map((date,i) => (
                <div key={i} style={{padding:'8px 4px',textAlign:'center',borderRight:'1px solid #f1f5f9',background:isToday(date)?'#eff6ff':''}}>
                  <span style={{display:'block',fontSize:10,fontWeight:700,color:'#6b7280',textTransform:'uppercase'}}>{DAY_SHORT_GV[date.getDay()]}</span>
                  <span style={{display:'block',fontSize:15,fontWeight:800,color:isToday(date)?'#0d47a1':'#1a202c'}}>{date.getDate()}/{date.getMonth()+1}</span>
                </div>
              ))}
            </div>
            {/* Body */}
            <div style={{display:'grid',gridTemplateColumns:'48px repeat(7,1fr)'}}>
              {/* Cột giờ */}
              <div style={{position:'relative',borderRight:'1px solid #e2e8f0',height:`${(TS+1)*SH}px`}}>
                {Array.from({length:TS+1},(_,i) => (
                  <div key={i} style={{position:'absolute',top:`${i*SH}px`,right:3,fontSize:9,color:'#9ca3af',fontWeight:600,paddingTop:2}}>{s2l(i)}</div>
                ))}
                {Array.from({length:TS+1},(_,i) => (
                  <div key={`l${i}`} style={{position:'absolute',top:`${i*SH}px`,left:0,right:0,borderTop:'1px solid #e2e8f0'}}/>
                ))}
              </div>
              {/* 7 cột ngày */}
              {weekDates.map((date,di) => {
                const items = getLichByDate(date)
                return (
                  <div key={di} style={{position:'relative',height:`${(TS+1)*SH}px`,borderRight:'1px solid #f1f5f9',background:isToday(date)?'#fafcff':''}}>
                    {Array.from({length:TS+1},(_,i) => (
                      <div key={i} style={{position:'absolute',top:`${i*SH}px`,left:0,right:0,borderTop:'1px solid #e2e8f0'}}/>
                    ))}
                    {items.map(lh => {
                      const c = LC[lh.loai_buoi] || LC.ly_thuyet
                      const s = getES(lh)
                      return (
                        <div key={lh.id} style={{position:'absolute',left:2,right:2,...s,background:c.bg,borderLeft:`3px solid ${c.border}`,borderRadius:5,padding:'2px 5px',overflow:'hidden',zIndex:2}}>
                          <p style={{fontSize:9,fontWeight:700,color:c.text,margin:0}}>{lh.gio_bat_dau?.slice(0,5)}–{lh.gio_ket_thuc?.slice(0,5)}</p>
                          <p style={{fontSize:10,fontWeight:700,color:c.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lh.lop_hoc?.ten_lop}</p>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lịch hôm nay */}
      <div className="card">
        <div className="card-header">
          <h3>📅 Lịch Dạy Hôm Nay</h3>
          <Link to="/diem-danh" className="btn btn-primary btn-sm">✅ Điểm danh →</Link>
        </div>
        <div className="card-body">
          {lichHomNay.length === 0 ? (
            <div className="empty-state"><span>🎉</span><p>Hôm nay bạn không có lịch dạy. Hãy nghỉ ngơi!</p></div>
          ) : (
            <div className="gv-lich-list">
              {lichHomNay.map(lh => (
                <div key={lh.id} className={`gv-lich-item ${lh.loai_buoi}`}>
                  <div className="gli-time">
                    <span>{lh.gio_bat_dau?.slice(0,5)}</span>
                    <span>—</span>
                    <span>{lh.gio_ket_thuc?.slice(0,5)}</span>
                  </div>
                  <div className="gli-info">
                    <p className="gli-lop">{lh.lop_hoc?.ten_lop}</p>
                    <p className="gli-type">{lh.loai_buoi==='ly_thuyet'?'📖 Lý thuyết':'🚗 Thực hành'}</p>
                    {lh.dia_diem && <p className="gli-dia">📍 {lh.dia_diem}</p>}
                  </div>
                  <Link to="/diem-danh" className="btn btn-success btn-sm">✅ Điểm danh</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lớp đang dạy */}
      <div className="card">
        <div className="card-header">
          <h3>🏫 Lớp Được Phân Công ({lopHoc.length})</h3>
          <Link to="/lop-cua-toi" className="btn btn-outline btn-sm">Xem tất cả →</Link>
        </div>
        <div className="card-body" style={{padding:0}}>
          {lopHoc.length === 0 ? (
            <div className="empty-state" style={{padding:'32px'}}><span>🏫</span><p>Chưa được phân công lớp nào</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Tên lớp</th><th>Khóa học</th><th>Học viên</th><th>Khai giảng</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {lopHoc.map(lop => (
                  <tr key={lop.id}>
                    <td><strong>{lop.ten_lop}</strong></td>
                    <td style={{fontSize:12}}>{lop.khoa_hoc?.ten_khoa}</td>
                    <td>{lop.hoc_vien_count||0} HV</td>
                    <td style={{fontSize:12}}>{lop.ngay_khai_giang ? new Date(lop.ngay_khai_giang).toLocaleDateString('vi-VN') : '—'}</td>
                    <td><span className={`badge ${lop.trang_thai==='dang_hoc'?'badge-success':'badge-info'}`}>
                      {lop.trang_thai==='dang_hoc'?'Đang học':'Chuẩn bị'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { isAdmin } = useAdmin()
  return isAdmin ? <AdminDashboard /> : <GiangVienDashboard />
}

export default Dashboard
