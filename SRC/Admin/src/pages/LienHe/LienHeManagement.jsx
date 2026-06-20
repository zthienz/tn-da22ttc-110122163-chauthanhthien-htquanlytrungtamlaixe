import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'

const TT_MAP   = { chua_xu_ly: 'badge-warning', da_xu_ly: 'badge-success' }
const TT_LABEL = { chua_xu_ly: 'Chưa xử lý',  da_xu_ly: 'Đã xử lý' }

const LienHeManagement = () => {
  const { token, backendUrl } = useAdmin()
  const headers = { Authorization: `Bearer ${token}` }

  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterTT, setFilterTT] = useState('')
  const [viewItem, setViewItem] = useState(null)
  const [ghiChu, setGhiChu]     = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lien-he`, { headers })
      if (res.data.success) setList(res.data.data)
    } catch { toast.error('Lỗi tải danh sách liên hệ') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleXuLy = async (item) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/lien-he/${item.id}/xu-ly`,
        { ghi_chu: ghiChu },
        { headers }
      )
      if (res.data.success) {
        toast.success('Đã đánh dấu xử lý')
        setViewItem(null)
        fetchAll()
      }
    } catch { toast.error('Xử lý thất bại') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa tin nhắn này?')) return
    try {
      const res = await axios.delete(`${backendUrl}/api/admin/lien-he/${id}`, { headers })
      if (res.data.success) { toast.success('Đã xóa'); fetchAll() }
    } catch { toast.error('Xóa thất bại') }
  }

  const openView = (item) => {
    setViewItem(item)
    setGhiChu(item.ghi_chu || '')
  }

  const filtered = list.filter(l => {
    const matchSearch = !search ||
      l.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
      l.so_dien_thoai?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
    const matchTT = !filterTT || l.trang_thai === filterTT
    return matchSearch && matchTT
  })

  const chuaXuLy = list.filter(l => l.trang_thai === 'chua_xu_ly').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>✉️ Quản Lý Liên Hệ</h2>
          <p>Tin nhắn từ khách hàng gửi qua trang Liên Hệ</p>
        </div>
        {chuaXuLy > 0 && (
          <span className="badge badge-warning" style={{ fontSize: 14, padding: '6px 14px' }}>
            {chuaXuLy} chưa xử lý
          </span>
        )}
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Tìm theo tên, SĐT, email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" style={{ maxWidth: 180 }}
          value={filterTT} onChange={e => setFilterTT(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="chua_xu_ly">Chưa xử lý</option>
          <option value="da_xu_ly">Đã xử lý</option>
        </select>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Nội dung</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    Không có tin nhắn nào
                  </td></tr>
                ) : filtered.map((l, i) => (
                  <tr key={l.id}>
                    <td>{i + 1}</td>
                    <td><strong>{l.ho_ten}</strong></td>
                    <td>{l.so_dien_thoai || '—'}</td>
                    <td style={{ fontSize: 12 }}>{l.email || '—'}</td>
                    <td style={{ maxWidth: 240 }}>
                      <span style={{ fontSize: 13, color: '#374151', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {l.noi_dung}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(l.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td>
                      <span className={`badge ${TT_MAP[l.trang_thai] || 'badge-gray'}`}>
                        {TT_LABEL[l.trang_thai] || l.trang_thai}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="btn btn-info btn-sm" onClick={() => openView(l)}>👁️ Xem</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✉️ Chi tiết tin nhắn</h3>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Họ tên',        value: viewItem.ho_ten },
                  { label: 'Số điện thoại', value: viewItem.so_dien_thoai || '—' },
                  { label: 'Email',          value: viewItem.email || '—' },
                  { label: 'Thời gian',      value: new Date(viewItem.created_at).toLocaleString('vi-VN') },
                ].map((f, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{f.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Nội dung</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{viewItem.noi_dung}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className={`badge ${TT_MAP[viewItem.trang_thai]}`}>
                  {TT_LABEL[viewItem.trang_thai]}
                </span>
                {viewItem.ghi_chu && (
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Ghi chú: {viewItem.ghi_chu}</span>
                )}
              </div>

              {viewItem.trang_thai === 'chua_xu_ly' && (
                <div className="form-group">
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ghi chú xử lý (tuỳ chọn)</label>
                  <textarea rows={2} value={ghiChu} onChange={e => setGhiChu(e.target.value)}
                    placeholder="VD: Đã gọi điện tư vấn, hẹn lịch..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, resize: 'vertical', fontSize: 13 }} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Đóng</button>
              <button className="btn btn-danger btn-sm" onClick={() => { handleDelete(viewItem.id); setViewItem(null) }}>🗑️ Xóa</button>
              {viewItem.trang_thai === 'chua_xu_ly' && (
                <button className="btn btn-primary" onClick={() => handleXuLy(viewItem)}>
                  ✅ Đánh dấu đã xử lý
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LienHeManagement
