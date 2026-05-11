import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAdmin } from '../../context/AdminContext'
import './Dashboard.css'

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { token, backendUrl } = useAdmin()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setStats(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

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

      {/* Charts row */}
      <div className="dash-charts-row">
        {/* Biểu đồ doanh thu */}
        <div className="card dash-chart-card">
          <div className="card-header">
            <h3>📈 Biểu Đồ Doanh Thu 7 Ngày</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v > 0 ? `${(v/1000000).toFixed(1)}M` : '0'} />
                <Tooltip formatter={v => `${Number(v).toLocaleString('vi-VN')}đ`} />
                <Bar dataKey="revenue" fill="#0d47a1" radius={[4,4,0,0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trạng thái học viên */}
        <div className="card dash-pie-card">
          <div className="card-header">
            <h3>🎯 Trạng Thái Học Viên</h3>
          </div>
          <div className="card-body dash-pie-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={trangThaiData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
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
      </div>

      {/* Quick actions */}
      <div className="card">
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
  )
}

// ── GIẢNG VIÊN DASHBOARD ─────────────────────────────────────────────────────
const GiangVienDashboard = () => {
  const { token, adminInfo, backendUrl } = useAdmin()
  const [lopHoc, setLopHoc]   = useState([])
  const [lichHomNay, setLichHomNay] = useState([])

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    axios.get(`${backendUrl}/api/giang-vien/lop-cua-toi`, { headers })
      .then(res => { if (res.data.success) setLopHoc(res.data.data) })
      .catch(() => {})
    axios.get(`${backendUrl}/api/giang-vien/lich-hom-nay`, { headers })
      .then(res => { if (res.data.success) setLichHomNay(res.data.data) })
      .catch(() => {})
  }, [token])

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>👨‍🏫 Xin chào, {adminInfo?.ho_ten}!</h2>
          <p>Tổng quan lịch dạy và lớp học của bạn hôm nay</p>
        </div>
      </div>

      <div className="dash-stat-grid">
        <div className="dash-stat-card" style={{'--c':'#3b82f6'}}>
          <div className="dsc-icon">🏫</div>
          <div className="dsc-body"><p>Lớp Đang Dạy</p><h3>{lopHoc.length}</h3></div>
        </div>
        <div className="dash-stat-card" style={{'--c':'#10b981'}}>
          <div className="dsc-icon">📅</div>
          <div className="dsc-body"><p>Buổi Học Hôm Nay</p><h3>{lichHomNay.length}</h3></div>
        </div>
      </div>

      {/* Lịch hôm nay */}
      <div className="card">
        <div className="card-header">
          <h3>📅 Lịch Dạy Hôm Nay</h3>
          <Link to="/diem-danh" className="btn btn-primary btn-sm">Điểm danh →</Link>
        </div>
        <div className="card-body">
          {lichHomNay.length === 0 ? (
            <div className="empty-state">
              <span>🎉</span>
              <p>Hôm nay bạn không có lịch dạy</p>
            </div>
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
                    <p className="gli-type">{lh.loai_buoi === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}</p>
                    {lh.dia_diem && <p className="gli-dia">📍 {lh.dia_diem}</p>}
                  </div>
                  <Link to="/diem-danh" className="btn btn-primary btn-sm">Điểm danh</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lớp đang dạy */}
      <div className="card">
        <div className="card-header">
          <h3>🏫 Lớp Học Của Tôi</h3>
          <Link to="/lop-cua-toi" className="btn btn-outline btn-sm">Xem tất cả →</Link>
        </div>
        <div className="card-body">
          {lopHoc.length === 0 ? (
            <div className="empty-state"><span>🏫</span><p>Chưa được phân công lớp nào</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên lớp</th><th>Khóa học</th><th>Chuyên môn</th><th>Sĩ số</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {lopHoc.map(lop => (
                  <tr key={lop.id}>
                    <td><strong>{lop.ten_lop}</strong></td>
                    <td>{lop.khoa_hoc?.ten_khoa}</td>
                    <td>{lop.chuyen_mon === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}</td>
                    <td>{lop.hoc_vien_count || 0} học viên</td>
                    <td><span className={`badge ${lop.trang_thai === 'dang_hoc' ? 'badge-success' : 'badge-info'}`}>
                      {lop.trang_thai === 'dang_hoc' ? 'Đang học' : 'Chuẩn bị'}
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
