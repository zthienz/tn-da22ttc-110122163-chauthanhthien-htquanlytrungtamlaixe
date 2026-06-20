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
  san_sang: { label: '✅ Sẵn sàng', cls: 'badge-success' },
  bao_tri:  { label: '🔧 Bảo trì',  cls: 'badge-warning' },
  hong:     { label: '❌ Hỏng',      cls: 'badge-danger'  },
}
const TRANG_THAI_LOP = {
  sap_khai_giang: { label: 'Sắp khai giảng', cls: 'badge-info'    },
  dang_hoc:       { label: 'Đang học',        cls: 'badge-success' },
}

const emptyForm = { xe_id: '', lich_hoc_id: '', tieu_de: '', mo_ta: '', muc_do: 'nhe' }

const GVXe = () => {
  const { token, backendUrl } = useTeacher()
  const [tab, setTab]           = useState('xe')
  const [xeList, setXeList]     = useState([])   // mảng lớp học, mỗi lớp có xe_list
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

  // Tổng số xe duy nhất qua tất cả lớp
  const tongXe = xeList.reduce((acc, lop) => acc + (lop.xe_list?.length || 0), 0)

  return (
    <div className="gvxe-page">
      <div className="page-header">
        <div><h2>🚗 Báo Lỗi Xe</h2><p>Thông tin xe được cấp và báo lỗi xe</p></div>
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
          <div className="card-header">
            <h3>🚗 Xe Được Phân Công Theo Lớp Thực Hành {tongXe > 0 && `(${tongXe} xe)`}</h3>
          </div>
          <div className="card-body" style={{ padding: xeList.length === 0 ? 0 : 16 }}>
            {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
              xeList.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px' }}>
                  <span>🚗</span>
                  <h3>Chưa có xe nào được phân công</h3>
                  <p>Quản trị viên sẽ phân xe cho các lớp thực hành của bạn</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {xeList.map(lop => (
                    <div key={lop.lop_hoc_id} className="gvxe-lop-block">

                      {/* Header lớp */}
                      <div className="gvxe-lop-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span className="gvxe-lop-name">🏫 {lop.ten_lop}</span>
                          {lop.loai_bang && (
                            <span className="badge badge-info">Hạng {lop.loai_bang}</span>
                          )}
                          <span className={`badge ${TRANG_THAI_LOP[lop.trang_thai]?.cls || 'badge-gray'}`}>
                            {TRANG_THAI_LOP[lop.trang_thai]?.label || lop.trang_thai}
                          </span>
                        </div>
                        {lop.ngay_khai_giang && (
                          <span style={{ fontSize: 12, color: '#718096' }}>
                            {new Date(lop.ngay_khai_giang).toLocaleDateString('vi-VN')}
                            {lop.ngay_ket_thuc && ` → ${new Date(lop.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                          </span>
                        )}
                      </div>

                      {/* Danh sách xe của lớp */}
                      <div className="gvxe-xe-grid">
                        {lop.xe_list.map(xe => (
                          <div key={xe.id} className="gvxe-xe-card">
                            {/* Ảnh xe */}
                            <div className="gvxe-xe-anh">
                              {xe.anh_xe
                                ? <img src={`/uploads/${xe.anh_xe}`} alt={xe.bien_so} className="gvxe-xe-img" />
                                : <span style={{ fontSize: 36 }}>🚗</span>}
                            </div>

                            {/* Thông tin xe */}
                            <div className="gvxe-info">
                              <div className="gvxe-bien-so">{xe.bien_so}</div>
                              <div className="gvxe-xe-detail">
                                <span className="gvxe-hang">{xe.hang_xe} {xe.dong_xe}</span>
                                <span className="gvxe-loai">
                                  {xe.loai_xe === 'so_san' ? '⚙️ Số sàn' : '🔄 Số tự động'}
                                </span>
                                {xe.mau_xe && (
                                  <span style={{ fontSize: 12, color: '#718096' }}>🎨 {xe.mau_xe}</span>
                                )}
                                {xe.so_km_hien_tai != null && (
                                  <span style={{ fontSize: 12, color: '#718096' }}>
                                    📏 {Number(xe.so_km_hien_tai).toLocaleString('vi-VN')} km
                                  </span>
                                )}
                              </div>
                              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span className="badge badge-info">Hạng {xe.hang_bang}</span>
                                <span className={`badge ${TT_XE_MAP[xe.trang_thai]?.cls || 'badge-gray'}`}>
                                  {TT_XE_MAP[xe.trang_thai]?.label || xe.trang_thai}
                                </span>
                              </div>
                            </div>

                            {/* Nút báo lỗi */}
                            <button
                              className="btn btn-warning btn-sm"
                              style={{ alignSelf: 'flex-start', marginTop: 4, flexShrink: 0 }}
                              onClick={() => { setForm({ ...emptyForm, xe_id: xe.id }); setShowModal(true) }}
                            >
                              ⚠️ Báo lỗi
                            </button>
                          </div>
                        ))}
                      </div>
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
                        <p style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                          {bl.mo_ta?.slice(0, 80)}{bl.mo_ta?.length > 80 ? '...' : ''}
                        </p>
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
                    {xeList.flatMap(lop =>
                      lop.xe_list.map(xe => (
                        <option key={`${lop.lop_hoc_id}-${xe.id}`} value={xe.id}>
                          {xe.bien_so} — {xe.hang_xe} {xe.dong_xe} ({lop.ten_lop})
                        </option>
                      ))
                    )}
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
