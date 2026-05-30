import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTeacher } from '../../context/TeacherContext'
import './GVXe.css'

const MUC_DO_MAP = {
  nhe:          { label: '🟡 Nhẹ',          cls: 'badge-warning' },
  trung_binh:   { label: '🟠 Trung bình',   cls: 'badge-warning' },
  nghiem_trong: { label: '🔴 Nghiêm trọng', cls: 'badge-danger'  },
}
const XLTT_MAP = {
  cho_xu_ly:  { label: '⏳ Chờ xử lý', cls: 'badge-warning' },
  dang_xu_ly: { label: '🔧 Đang xử lý', cls: 'badge-info'    },
  da_xu_ly:   { label: '✅ Đã xử lý',   cls: 'badge-success' },
}
const TT_XE_MAP = {
  san_sang:     { label: '✅ Sẵn sàng',   cls: 'badge-success' },
  dang_su_dung: { label: '🚗 Đang dùng', cls: 'badge-info'    },
  bao_tri:      { label: '🔧 Bảo trì',   cls: 'badge-warning' },
  hong:         { label: '❌ Hỏng',       cls: 'badge-danger'  },
}

const emptyForm = { xe_id: '', lich_hoc_id: '', tieu_de: '', mo_ta: '', muc_do: 'nhe' }

const GVXe = () => {
  const { token, backendUrl } = useTeacher()
  const [tab, setTab]           = useState('xe')
  const [xeList, setXeList]     = useState([])
  const [lichSu, setLichSu]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const headers = { Authorization: `Bearer ${token}` }

  const fetchXe = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/giang-vien/xe-cua-toi`, { headers })
      if (res.data.success) setXeList(res.data.data)
    } catch {}
    setLoading(false)
  }

  const fetchLichSu = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/giang-vien/bao-loi-xe`, { headers })
      if (res.data.success) setLichSu(res.data.data)
    } catch {}
  }

  useEffect(() => { fetchXe(); fetchLichSu() }, [])

  const openBaoLoi = (lich) => {
    setForm({ ...emptyForm, xe_id: lich.xe?.id || '', lich_hoc_id: lich.id })
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.post(`${backendUrl}/api/giang-vien/bao-loi-xe`, form, { headers })
      if (res.data.success) {
        toast.success('Báo lỗi thành công! Quản trị viên sẽ xử lý sớm.')
        setShowModal(false)
        fetchLichSu()
        if (form.muc_do === 'nghiem_trong') fetchXe()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
    setSaving(false)
  }

  const choXuLyCount = lichSu.filter(b => b.trang_thai === 'cho_xu_ly').length

  return (
    <div className="gvxe-page">
      <div className="page-header">
        <div><h2>🚗 Xe Của Tôi</h2><p>Thông tin xe được cấp và báo lỗi xe</p></div>
        <button className="btn btn-warning" onClick={() => { setForm(emptyForm); setShowModal(true) }}>
          ⚠️ Báo lỗi xe
        </button>
      </div>

      {/* Tabs */}
      <div className="gvxe-tabs">
        <button className={`gvxe-tab ${tab === 'xe' ? 'active' : ''}`} onClick={() => setTab('xe')}>
          🚗 Xe Được Cấp
        </button>
        <button className={`gvxe-tab ${tab === 'lich_su' ? 'active' : ''}`} onClick={() => setTab('lich_su')}>
          📋 Lịch Sử Báo Lỗi
          {choXuLyCount > 0 && <span className="gvxe-badge-count">{choXuLyCount}</span>}
        </button>
      </div>

      {/* Tab: Xe được cấp */}
      {tab === 'xe' && (
        <div className="card">
          <div className="card-header"><h3>🚗 Xe Được Phân Công Cho Buổi Thực Hành</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
              xeList.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <span>🚗</span>
                  <h3>Chưa có xe nào được phân công</h3>
                  <p>Quản trị viên sẽ phân xe cho các buổi thực hành sắp tới</p>
                </div>
              ) : (
                <div className="gvxe-list">
                  {xeList.map(lich => (
                    <div key={lich.id} className="gvxe-card">
                      <div className="gvxe-date">
                        <span className="gvxe-day">{new Date(lich.ngay_hoc).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                        <span className="gvxe-num">{new Date(lich.ngay_hoc).getDate()}</span>
                        <span className="gvxe-month">{new Date(lich.ngay_hoc).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                      </div>
                      <div className="gvxe-info">
                        <div className="gvxe-lop">{lich.lop_hoc?.ten_lop} — {lich.gio_bat_dau?.slice(0, 5)}–{lich.gio_ket_thuc?.slice(0, 5)}</div>
                        <div className="gvxe-xe-detail">
                          <span className="gvxe-bien-so">🚗 {lich.xe?.bien_so}</span>
                          <span className="gvxe-hang">{lich.xe?.hang_xe} {lich.xe?.dong_xe}</span>
                          <span className="gvxe-loai">{lich.xe?.loai_xe === 'so_san' ? 'Số sàn' : 'Số tự động'}</span>
                          <span className={`badge ${TT_XE_MAP[lich.xe?.trang_thai]?.cls || 'badge-gray'}`}>
                            {TT_XE_MAP[lich.xe?.trang_thai]?.label || lich.xe?.trang_thai}
                          </span>
                        </div>
                        {lich.xe?.mau_xe && (
                          <p style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                            Màu: {lich.xe.mau_xe} | Km: {lich.xe.so_km_hien_tai?.toLocaleString()} km
                          </p>
                        )}
                      </div>
                      <button className="btn btn-warning btn-sm" onClick={() => openBaoLoi(lich)}>
                        ⚠️ Báo lỗi
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Tab: Lịch sử báo lỗi */}
      {tab === 'lich_su' && (
        <div className="card">
          <div className="card-header"><h3>📋 Lịch Sử Báo Lỗi Của Tôi ({lichSu.length})</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {lichSu.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px' }}><span>📋</span><p>Chưa có báo lỗi nào</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Xe</th><th>Tiêu đề</th><th>Mức độ</th><th>Trạng thái</th><th>Ghi chú xử lý</th><th>Ngày báo</th></tr>
                </thead>
                <tbody>
                  {lichSu.map((bl, i) => (
                    <tr key={bl.id}>
                      <td>{i + 1}</td>
                      <td>
                        <strong style={{ color: '#059669' }}>{bl.xe?.bien_so}</strong>
                        <br /><span style={{ fontSize: 11, color: '#718096' }}>{bl.xe?.hang_xe}</span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{bl.tieu_de}</p>
                        <p style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{bl.mo_ta?.slice(0, 80)}{bl.mo_ta?.length > 80 ? '...' : ''}</p>
                      </td>
                      <td><span className={`badge ${MUC_DO_MAP[bl.muc_do]?.cls}`}>{MUC_DO_MAP[bl.muc_do]?.label}</span></td>
                      <td><span className={`badge ${XLTT_MAP[bl.trang_thai]?.cls}`}>{XLTT_MAP[bl.trang_thai]?.label}</span></td>
                      <td style={{ fontSize: 12, color: '#718096' }}>{bl.ghi_chu_xu_ly || '—'}</td>
                      <td style={{ fontSize: 12 }}>{new Date(bl.created_at).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal báo lỗi */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Báo Lỗi Xe</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Xe bị lỗi *</label>
                  <select value={form.xe_id} onChange={e => setForm({ ...form, xe_id: e.target.value })} required>
                    <option value="">-- Chọn xe --</option>
                    {xeList.map(l => (
                      <option key={l.xe?.id} value={l.xe?.id}>
                        {l.xe?.bien_so} — {l.xe?.hang_xe} {l.xe?.dong_xe} ({new Date(l.ngay_hoc).toLocaleDateString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức độ hư hỏng *</label>
                  <select value={form.muc_do} onChange={e => setForm({ ...form, muc_do: e.target.value })}>
                    <option value="nhe">🟡 Nhẹ — Vẫn có thể sử dụng</option>
                    <option value="trung_binh">🟠 Trung bình — Cần kiểm tra sớm</option>
                    <option value="nghiem_trong">🔴 Nghiêm trọng — Không thể sử dụng</option>
                  </select>
                  {form.muc_do === 'nghiem_trong' && (
                    <p style={{ fontSize: 12, color: '#e53e3e', marginTop: 6 }}>
                      ⚠️ Xe sẽ tự động chuyển sang trạng thái "Hỏng" và không thể phân công cho buổi học mới.
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Tiêu đề *</label>
                  <input value={form.tieu_de} onChange={e => setForm({ ...form, tieu_de: e.target.value })}
                    placeholder="VD: Lốp xe bị xẹp, Đèn pha không sáng..." required />
                </div>
                <div className="form-group">
                  <label>Mô tả chi tiết *</label>
                  <textarea rows={4} value={form.mo_ta} onChange={e => setForm({ ...form, mo_ta: e.target.value })}
                    placeholder="Mô tả chi tiết tình trạng hư hỏng, thời điểm phát hiện..." required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-warning" disabled={saving}>
                  {saving ? 'Đang gửi...' : '⚠️ Gửi báo lỗi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GVXe
