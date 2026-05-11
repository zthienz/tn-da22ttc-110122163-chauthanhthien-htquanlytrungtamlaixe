import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './HoSoManagement.css'

const TRANG_THAI_MAP = {
  cho_dong_hoc_phi:      { text:'Chờ đóng HP',       cls:'badge-warning' },
  cho_mo_lop:            { text:'Chờ mở lớp',         cls:'badge-info' },
  dang_hoc:              { text:'Đang học',            cls:'badge-success' },
  chua_du_dieu_kien_thi: { text:'Chưa đủ ĐK thi',     cls:'badge-danger' },
  du_dieu_kien_thi_tn:   { text:'Đủ ĐK thi TN',       cls:'badge-blue' },
  hoan_thanh_tn:         { text:'Hoàn thành TN',       cls:'badge-success' },
  da_cap_bang:           { text:'Đã cấp bằng',         cls:'badge-success' },
  dinh_chi:              { text:'Đình chỉ',            cls:'badge-danger' },
}

const HoSoManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterTT, setFilterTT] = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal]   = useState(false)
  const [showHocPhiModal, setShowHocPhiModal] = useState(false)
  const [showXepLopModal, setShowXepLopModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [lopList, setLopList]   = useState([])

  const headers = { Authorization: `Bearer ${token}` }

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/ho-so`, {
        headers,
        params: { search, trang_thai: filterTT, page, per_page: 15 }
      })
      if (res.data.success) {
        setList(res.data.data)
        setTotalPages(res.data.pages || 1)
      }
    } catch { toast.error('Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }

  const fetchLopList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lop-hoc`, { headers })
      if (res.data.success) setLopList(res.data.data)
    } catch {}
  }

  useEffect(() => { fetchList() }, [search, filterTT, page])

  // Form tạo hồ sơ offline
  const [form, setForm] = useState({ ho_ten:'', ngay_sinh:'', so_cccd:'', khoa_hoc_id:'', so_dien_thoai:'', dia_chi:'', email:'' })
  const [khoaList, setKhoaList] = useState([])

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/khoa-hoc`, { headers })
      .then(res => { if (res.data.success) setKhoaList(res.data.data) })
      .catch(() => {})
  }, [])

  const handleTaoHoSo = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/ho-so`, form, { headers })
      if (res.data.success) {
        toast.success('Tạo hồ sơ thành công!')
        setShowModal(false)
        setForm({ ho_ten:'', ngay_sinh:'', so_cccd:'', khoa_hoc_id:'', so_dien_thoai:'', dia_chi:'', email:'' })
        fetchList()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi tạo hồ sơ') }
  }

  // Ghi nhận học phí
  const [hocPhiForm, setHocPhiForm] = useState({ so_tien:'', phuong_thuc:'tien_mat', ma_giao_dich:'' })
  const handleGhiHocPhi = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/ho-so/${selected.id}/hoc-phi`, hocPhiForm, { headers })
      if (res.data.success) {
        toast.success('Ghi nhận học phí thành công!')
        setShowHocPhiModal(false)
        fetchList()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  // Xếp lớp + tạo tài khoản
  const [xepLopForm, setXepLopForm] = useState({ lop_hoc_id:'' })
  const handleXepLop = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/ho-so/${selected.id}/xep-lop`, xepLopForm, { headers })
      if (res.data.success) {
        toast.success(res.data.message)
        if (res.data.tai_khoan) {
          alert(`✅ Tài khoản học viên:\n• CCCD: ${res.data.tai_khoan.so_cccd}\n• Mật khẩu: ${res.data.tai_khoan.mat_khau}\n\n${res.data.tai_khoan.huong_dan}`)
        }
        setShowXepLopModal(false)
        fetchList()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  return (
    <div className="hoso-page">
      <div className="page-header">
        <div>
          <h2>📋 Hồ Sơ Học Viên</h2>
          <p>Quản lý toàn bộ hồ sơ đăng ký học lái xe</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Thêm hồ sơ offline
        </button>
      </div>

      {/* Filter */}
      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Tìm theo tên, CCCD, SĐT..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="search-input" style={{maxWidth:200}} value={filterTT}
          onChange={e => { setFilterTT(e.target.value); setPage(1) }}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(TRANG_THAI_MAP).map(([k,v]) => (
            <option key={k} value={k}>{v.text}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
            <div style={{overflowX:'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Họ Tên</th><th>CCCD</th><th>SĐT</th>
                    <th>Khóa Học</th><th>Học Phí</th><th>Trạng Thái</th>
                    <th>Nguồn</th><th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr><td colSpan={9} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>Không có dữ liệu</td></tr>
                  ) : list.map((hs, i) => {
                    const ts = TRANG_THAI_MAP[hs.trang_thai] || { text: hs.trang_thai, cls:'badge-gray' }
                    return (
                      <tr key={hs.id}>
                        <td>{(page-1)*15 + i + 1}</td>
                        <td><strong>{hs.ho_ten}</strong></td>
                        <td><code style={{fontSize:12}}>{hs.so_cccd}</code></td>
                        <td>{hs.so_dien_thoai || '—'}</td>
                        <td>{hs.khoa_hoc?.ten_khoa || '—'}</td>
                        <td>
                          <span className={`badge ${hs.trang_thai_hoc_phi === 'da_dong' ? 'badge-success' : 'badge-danger'}`}>
                            {hs.trang_thai_hoc_phi === 'da_dong' ? '✅ Đã đóng' : '❌ Chưa đóng'}
                          </span>
                        </td>
                        <td><span className={`badge ${ts.cls}`}>{ts.text}</span></td>
                        <td>
                          <span className={`badge ${hs.nguon_dang_ky === 'online' ? 'badge-blue' : 'badge-gray'}`}>
                            {hs.nguon_dang_ky === 'online' ? '🌐 Online' : '🏢 Offline'}
                          </span>
                        </td>
                        <td>
                          <div className="action-cell">
                            {hs.trang_thai_hoc_phi !== 'da_dong' && (
                              <button className="btn btn-success btn-sm"
                                onClick={() => { setSelected(hs); setShowHocPhiModal(true) }}>
                                💰 Thu HP
                              </button>
                            )}
                            {hs.trang_thai_hoc_phi === 'da_dong' && hs.trang_thai === 'cho_mo_lop' && (
                              <button className="btn btn-primary btn-sm"
                                onClick={() => { setSelected(hs); fetchLopList(); setShowXepLopModal(true) }}>
                                🏫 Xếp lớp
                              </button>
                            )}
                            {hs.user_id && (
                              <button className="btn btn-warning btn-sm"
                                onClick={async () => {
                                  if (!confirm('Reset mật khẩu về ngày sinh?')) return
                                  const res = await axios.post(`${backendUrl}/api/admin/ho-so/${hs.id}/reset-mat-khau`, {}, { headers })
                                  if (res.data.success) toast.success(`Mật khẩu mới: ${res.data.mat_khau}`)
                                }}>
                                🔑 Reset MK
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal tạo hồ sơ offline */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Thêm Hồ Sơ Offline</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaoHoSo}>
              <div className="modal-body">
                <div className="form-row-2">
                  <div className="form-group"><label>Họ và tên *</label><input value={form.ho_ten} onChange={e=>setForm({...form,ho_ten:e.target.value})} required /></div>
                  <div className="form-group"><label>Số CCCD *</label><input value={form.so_cccd} onChange={e=>setForm({...form,so_cccd:e.target.value})} required /></div>
                </div>
                <div className="form-row-2">
                  <div className="form-group"><label>Ngày sinh *</label><input type="date" value={form.ngay_sinh} onChange={e=>setForm({...form,ngay_sinh:e.target.value})} required /></div>
                  <div className="form-group"><label>Số điện thoại</label><input value={form.so_dien_thoai} onChange={e=>setForm({...form,so_dien_thoai:e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Khóa học *</label>
                  <select value={form.khoa_hoc_id} onChange={e=>setForm({...form,khoa_hoc_id:e.target.value})} required>
                    <option value="">-- Chọn khóa học --</option>
                    {khoaList.map(k => <option key={k.id} value={k.id}>{k.ten_khoa} (Hạng {k.loai_bang})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Địa chỉ</label><input value={form.dia_chi} onChange={e=>setForm({...form,dia_chi:e.target.value})} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thu học phí */}
      {showHocPhiModal && selected && (
        <div className="modal-overlay" onClick={() => setShowHocPhiModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Ghi Nhận Học Phí — {selected.ho_ten}</h3>
              <button className="modal-close" onClick={() => setShowHocPhiModal(false)}>✕</button>
            </div>
            <form onSubmit={handleGhiHocPhi}>
              <div className="modal-body">
                <div className="hocphi-info">
                  <p>Khóa học: <strong>{selected.khoa_hoc?.ten_khoa}</strong></p>
                  <p>Học phí: <strong>{Number(selected.khoa_hoc?.hoc_phi||0).toLocaleString('vi-VN')} VNĐ</strong></p>
                </div>
                <div className="form-group"><label>Số tiền thu *</label>
                  <input type="number" value={hocPhiForm.so_tien} onChange={e=>setHocPhiForm({...hocPhiForm,so_tien:e.target.value})} required placeholder="VD: 7500000" />
                </div>
                <div className="form-group"><label>Phương thức *</label>
                  <select value={hocPhiForm.phuong_thuc} onChange={e=>setHocPhiForm({...hocPhiForm,phuong_thuc:e.target.value})}>
                    <option value="tien_mat">Tiền mặt</option>
                    <option value="chuyen_khoan">Chuyển khoản</option>
                    <option value="vnpay">VNPay</option>
                    <option value="momo">MoMo</option>
                  </select>
                </div>
                <div className="form-group"><label>Mã giao dịch</label>
                  <input value={hocPhiForm.ma_giao_dich} onChange={e=>setHocPhiForm({...hocPhiForm,ma_giao_dich:e.target.value})} placeholder="Tùy chọn" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowHocPhiModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-success">✅ Xác nhận thu tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xếp lớp */}
      {showXepLopModal && selected && (
        <div className="modal-overlay" onClick={() => setShowXepLopModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏫 Xếp Lớp — {selected.ho_ten}</h3>
              <button className="modal-close" onClick={() => setShowXepLopModal(false)}>✕</button>
            </div>
            <form onSubmit={handleXepLop}>
              <div className="modal-body">
                <div className="hocphi-info">
                  <p>Khóa học: <strong>{selected.khoa_hoc?.ten_khoa}</strong></p>
                  <p className="info-note">⚠️ Sau khi xếp lớp, hệ thống sẽ tự động tạo tài khoản học viên với:<br/>
                    • Tài khoản: <strong>{selected.so_cccd}</strong><br/>
                    • Mật khẩu: <strong>Ngày sinh (DDMMYYYY)</strong>
                  </p>
                </div>
                <div className="form-group"><label>Chọn lớp học *</label>
                  <select value={xepLopForm.lop_hoc_id} onChange={e=>setXepLopForm({lop_hoc_id:e.target.value})} required>
                    <option value="">-- Chọn lớp --</option>
                    {lopList.filter(l => l.khoa_hoc_id === selected.khoa_hoc_id || true).map(l => (
                      <option key={l.id} value={l.id}>{l.ten_lop} — {l.khoa_hoc?.ten_khoa} ({l.hoc_vien_count||0}/{l.si_so_toi_da})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowXepLopModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">🏫 Xếp lớp & Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HoSoManagement
