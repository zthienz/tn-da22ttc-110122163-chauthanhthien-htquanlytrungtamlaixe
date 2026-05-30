import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './HocPhiManagement.css'

const PHUONG_THUC_MAP = {
  tien_mat:     { text: '💵 Tiền mặt',     cls: 'badge-gray' },
  chuyen_khoan: { text: '🏦 Chuyển khoản', cls: 'badge-blue' },
  vnpay:        { text: '💳 VNPay',         cls: 'badge-info' },
  momo:         { text: '📱 MoMo',          cls: 'badge-purple' },
}

const HocPhiManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterPM, setFilterPM] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const headers = { Authorization: `Bearer ${token}` }

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/hoc-phi`, { headers })
      if (res.data.success) setList(res.data.data)
      else toast.error(res.data.message || 'Lỗi tải dữ liệu')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const filtered = list.filter(item => {
    const matchSearch = !search ||
      item.ho_so?.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
      item.ho_so?.so_cccd?.includes(search) ||
      (item.ma_giao_dich || '').includes(search)
    const matchPM = !filterPM || item.phuong_thuc === filterPM
    return matchSearch && matchPM
  })

  const tongThu = filtered.reduce((s, i) => s + Number(i.so_tien || 0), 0)
  const tienMat = filtered.filter(i => i.phuong_thuc === 'tien_mat').reduce((s, i) => s + Number(i.so_tien || 0), 0)
  const online  = filtered.filter(i => i.phuong_thuc !== 'tien_mat').reduce((s, i) => s + Number(i.so_tien || 0), 0)

  return (
    <div className="hocphi-page">
      <div className="page-header">
        <div>
          <h2>💰 Quản Lý Học Phí</h2>
          <p>Theo dõi lịch sử thu học phí học viên</p>
        </div>
        <button className="btn btn-outline" onClick={fetchList}>🔄 Làm mới</button>
      </div>

      {/* Thống kê nhanh */}
      <div className="hocphi-stats">
        <div className="hocphi-stat-card">
          <div className="hocphi-stat-icon">📋</div>
          <div>
            <div className="hocphi-stat-value">{filtered.length}</div>
            <div className="hocphi-stat-label">Giao dịch</div>
          </div>
        </div>
        <div className="hocphi-stat-card green">
          <div className="hocphi-stat-icon">💰</div>
          <div>
            <div className="hocphi-stat-value">{tongThu.toLocaleString('vi-VN')} ₫</div>
            <div className="hocphi-stat-label">Tổng thu</div>
          </div>
        </div>
        <div className="hocphi-stat-card orange">
          <div className="hocphi-stat-icon">💵</div>
          <div>
            <div className="hocphi-stat-value">{tienMat.toLocaleString('vi-VN')} ₫</div>
            <div className="hocphi-stat-label">Tiền mặt</div>
          </div>
        </div>
        <div className="hocphi-stat-card blue">
          <div className="hocphi-stat-icon">🏦</div>
          <div>
            <div className="hocphi-stat-value">{online.toLocaleString('vi-VN')} ₫</div>
            <div className="hocphi-stat-label">Chuyển khoản / Online</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="🔍 Tìm theo tên, CCCD, mã giao dịch..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="search-input" style={{ maxWidth: 200 }} value={filterPM} onChange={e => setFilterPM(e.target.value)}>
          <option value="">Tất cả phương thức</option>
          {Object.entries(PHUONG_THUC_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.text}</option>
          ))}
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Học viên</th><th>CCCD</th><th>Khóa học</th>
                  <th>Số tiền</th><th>Phương thức</th><th>Mã GD</th>
                  <th>Người thu</th><th>Ngày thu</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    Chưa có dữ liệu học phí
                  </td></tr>
                ) : filtered.map((item, i) => {
                  const pm = PHUONG_THUC_MAP[item.phuong_thuc] || { text: item.phuong_thuc, cls: 'badge-gray' }
                  return (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td><strong>{item.ho_so?.ho_ten || '—'}</strong></td>
                      <td><code style={{ fontSize: 12 }}>{item.ho_so?.so_cccd || '—'}</code></td>
                      <td style={{ fontSize: 12 }}>{item.ho_so?.khoa_hoc?.ten_khoa || '—'}</td>
                      <td>
                        <strong style={{ color: '#16a34a' }}>
                          {Number(item.so_tien || 0).toLocaleString('vi-VN')} ₫
                        </strong>
                      </td>
                      <td><span className={`badge ${pm.cls}`}>{pm.text}</span></td>
                      <td>
                        {item.ma_giao_dich
                          ? <code style={{ fontSize: 11 }}>{item.ma_giao_dich}</code>
                          : <span style={{ color: '#a0aec0' }}>—</span>}
                      </td>
                      <td style={{ fontSize: 12 }}>{item.nguoi_thu || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {item.ngay_thanh_toan
                          ? new Date(item.ngay_thanh_toan).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td>
                        <button className="btn btn-info btn-sm" onClick={() => setViewItem(item)}>
                          👁️ Xem
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ghi chú */}
      <div style={{ marginTop: 12, padding: '10px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
        ℹ️ Để thu học phí cho học viên, vào <strong>Hồ Sơ Học Viên</strong> → chọn học viên → nhấn <strong>💰 Thu HP</strong>
      </div>

      {/* ── Modal xem chi tiết ── */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Chi Tiết Giao Dịch Học Phí</h3>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Header học viên */}
              <div className="hocphi-detail-card">
                <div className="hocphi-detail-avatar">
                  {viewItem.ho_so?.ho_ten?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="hocphi-detail-name">{viewItem.ho_so?.ho_ten}</p>
                  <code className="hocphi-detail-cccd">{viewItem.ho_so?.so_cccd}</code>
                </div>
              </div>

              {/* Chi tiết giao dịch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginTop: 16 }}>
                {[
                  ['Khóa học',      viewItem.ho_so?.khoa_hoc?.ten_khoa || '—'],
                  ['Số tiền',       Number(viewItem.so_tien || 0).toLocaleString('vi-VN') + ' VNĐ'],
                  ['Phương thức',   PHUONG_THUC_MAP[viewItem.phuong_thuc]?.text || viewItem.phuong_thuc],
                  ['Mã giao dịch',  viewItem.ma_giao_dich || '—'],
                  ['Người thu',     viewItem.nguoi_thu || '—'],
                  ['Ngày thu',      viewItem.ngay_thanh_toan ? new Date(viewItem.ngay_thanh_toan).toLocaleDateString('vi-VN') : '—'],
                  ['Trạng thái',    viewItem.trang_thai === 'thanh_cong' ? '✅ Thành công' : viewItem.trang_thai || '—'],
                  ['Ghi chú',       viewItem.ghi_chu || '—'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: '#718096', fontSize: 12 }}>{k}</span>
                    <strong style={{ fontSize: 14 }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HocPhiManagement
