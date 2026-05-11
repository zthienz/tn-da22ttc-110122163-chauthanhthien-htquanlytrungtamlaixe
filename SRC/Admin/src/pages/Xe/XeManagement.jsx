import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './XeManagement.css'

const TRANG_THAI_MAP = {
  san_sang:     { label: '✅ Sẵn sàng',      cls: 'badge-success' },
  dang_su_dung: { label: '🚗 Đang dùng',     cls: 'badge-info' },
  bao_tri:      { label: '🔧 Bảo trì',       cls: 'badge-warning' },
  hong:         { label: '❌ Hỏng',           cls: 'badge-danger' },
  nghi_huu:     { label: '🚫 Nghỉ hưu',      cls: 'badge-gray' },
}
const LOAI_XE_MAP   = { so_san: 'Số sàn', so_tu_dong: 'Số tự động' }
const MUC_DO_MAP    = { nhe: { label: '🟡 Nhẹ', cls: 'badge-warning' }, trung_binh: { label: '🟠 Trung bình', cls: 'badge-warning' }, nghiem_trong: { label: '🔴 Nghiêm trọng', cls: 'badge-danger' } }
const XLTT_MAP      = { cho_xu_ly: { label: '⏳ Chờ xử lý', cls: 'badge-warning' }, dang_xu_ly: { label: '🔧 Đang xử lý', cls: 'badge-info' }, da_xu_ly: { label: '✅ Đã xử lý', cls: 'badge-success' } }

const emptyForm = { bien_so:'', hang_xe:'', dong_xe:'', nam_san_xuat:'', loai_xe:'so_san', hang_bang:'B2', mau_xe:'', so_km_hien_tai:0, ngay_dang_kiem:'', ngay_dang_kiem_tiep_theo:'', ngay_bao_hiem:'', ghi_chu:'' }

const XeManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [tab, setTab]         = useState('xe')          // 'xe' | 'bao_loi'
  const [xeList, setXeList]   = useState([])
  const [baoLoiList, setBaoLoiList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [showDetail, setShowDetail] = useState(null)    // xe detail
  const [showXuLy, setShowXuLy]     = useState(null)    // bao loi xu ly
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [xuLyForm, setXuLyForm] = useState({ trang_thai:'dang_xu_ly', ghi_chu_xu_ly:'' })
  const [filterTT, setFilterTT] = useState('')
  const [filterBL, setFilterBL] = useState('')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchXe = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/xe`, { headers, params: { trang_thai: filterTT } })
      if (res.data.success) setXeList(res.data.data)
    } catch {}
    setLoading(false)
  }

  const fetchBaoLoi = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/bao-loi-xe`, { headers, params: { trang_thai: filterBL } })
      if (res.data.success) setBaoLoiList(res.data.data)
    } catch {}
  }

  useEffect(() => { fetchXe() }, [filterTT])
  useEffect(() => { fetchBaoLoi() }, [filterBL])

  const openAdd  = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = xe => { setEditItem(xe); setForm({ ...emptyForm, ...xe, ngay_dang_kiem: xe.ngay_dang_kiem?.split('T')[0]||'', ngay_dang_kiem_tiep_theo: xe.ngay_dang_kiem_tiep_theo?.split('T')[0]||'', ngay_bao_hiem: xe.ngay_bao_hiem?.split('T')[0]||'' }); setShowModal(true) }

  const handleSave = async e => {
    e.preventDefault()
    try {
      const res = editItem
        ? await axios.put(`${backendUrl}/api/admin/xe/${editItem.id}`, form, { headers })
        : await axios.post(`${backendUrl}/api/admin/xe`, form, { headers })
      if (res.data.success) { toast.success(editItem ? 'Cập nhật xe thành công!' : 'Thêm xe thành công!'); setShowModal(false); fetchXe() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleDelete = async id => {
    if (!confirm('Xóa xe này?')) return
    try {
      const res = await axios.delete(`${backendUrl}/api/admin/xe/${id}`, { headers })
      if (res.data.success) { toast.success('Đã xóa xe'); fetchXe() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleTrangThai = async (id, tt) => {
    try {
      const res = await axios.patch(`${backendUrl}/api/admin/xe/${id}/trang-thai`, { trang_thai: tt }, { headers })
      if (res.data.success) { toast.success('Cập nhật trạng thái thành công'); fetchXe() }
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleXuLy = async e => {
    e.preventDefault()
    try {
      const res = await axios.patch(`${backendUrl}/api/admin/bao-loi-xe/${showXuLy.id}/xu-ly`, xuLyForm, { headers })
      if (res.data.success) { toast.success('Cập nhật xử lý thành công!'); setShowXuLy(null); fetchBaoLoi(); fetchXe() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const openDetail = async xe => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/xe/${xe.id}`, { headers })
      if (res.data.success) setShowDetail(res.data.data)
    } catch {}
  }

  const tongSanSang = xeList.filter(x => x.trang_thai === 'san_sang').length
  const tongHong    = xeList.filter(x => x.trang_thai === 'hong').length
  const tongBaoTri  = xeList.filter(x => x.trang_thai === 'bao_tri').length
  const choXuLy     = baoLoiList.filter(b => b.trang_thai === 'cho_xu_ly').length

  return (
    <div className="xe-page">
      <div className="page-header">
        <div><h2>🚗 Quản Lý Xe</h2><p>Quản lý đội xe và theo dõi tình trạng</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm xe</button>
      </div>

      {/* Stats */}
      <div className="xe-stats">
        {[
          { icon:'🚗', label:'Tổng xe',     value: xeList.length,  cls:'' },
          { icon:'✅', label:'Sẵn sàng',    value: tongSanSang,    cls:'green' },
          { icon:'❌', label:'Hỏng',         value: tongHong,       cls:'red' },
          { icon:'🔧', label:'Bảo trì',     value: tongBaoTri,     cls:'orange' },
          { icon:'⚠️', label:'Chờ xử lý',  value: choXuLy,        cls:'yellow' },
        ].map((s,i) => (
          <div key={i} className={`xe-stat-card ${s.cls}`}>
            <span className="xsc-icon">{s.icon}</span>
            <div><p className="xsc-value">{s.value}</p><p className="xsc-label">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="xe-tabs">
        <button className={`xe-tab ${tab==='xe'?'active':''}`} onClick={() => setTab('xe')}>🚗 Danh Sách Xe</button>
        <button className={`xe-tab ${tab==='bao_loi'?'active':''}`} onClick={() => setTab('bao_loi')}>
          ⚠️ Báo Lỗi {choXuLy > 0 && <span className="xe-badge-count">{choXuLy}</span>}
        </button>
      </div>

      {/* Tab: Danh sách xe */}
      {tab === 'xe' && (
        <div className="card">
          <div className="card-header" style={{display:'flex',alignItems:'center',gap:12}}>
            <h3>🚗 Đội Xe ({xeList.length})</h3>
            <select className="search-input" style={{maxWidth:180}} value={filterTT} onChange={e=>setFilterTT(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(TRANG_THAI_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="card-body" style={{padding:0}}>
            {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Biển số</th><th>Hãng / Dòng xe</th><th>Loại</th><th>Hạng bằng</th><th>Km hiện tại</th><th>Đăng kiểm</th><th>Trạng thái</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                  {xeList.length === 0
                    ? <tr><td colSpan={9} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>Chưa có xe nào</td></tr>
                    : xeList.map((xe, i) => {
                      const tt = TRANG_THAI_MAP[xe.trang_thai] || { label: xe.trang_thai, cls: 'badge-gray' }
                      const sắpHetHan = xe.ngay_dang_kiem_tiep_theo && new Date(xe.ngay_dang_kiem_tiep_theo) < new Date(Date.now() + 30*24*60*60*1000)
                      return (
                        <tr key={xe.id}>
                          <td>{i+1}</td>
                          <td>
                            <strong style={{fontSize:15,color:'#0d47a1'}}>{xe.bien_so}</strong>
                            {xe.bao_loi_count > 0 && <span className="xe-loi-badge">⚠️ {xe.bao_loi_count}</span>}
                          </td>
                          <td>
                            <p style={{fontWeight:600}}>{xe.hang_xe}</p>
                            <p style={{fontSize:12,color:'#718096'}}>{xe.dong_xe || '—'} {xe.nam_san_xuat ? `(${xe.nam_san_xuat})` : ''}</p>
                          </td>
                          <td>{LOAI_XE_MAP[xe.loai_xe]}</td>
                          <td><span className="badge badge-info">Hạng {xe.hang_bang}</span></td>
                          <td>{xe.so_km_hien_tai?.toLocaleString()} km</td>
                          <td>
                            {xe.ngay_dang_kiem_tiep_theo
                              ? <span style={{color: sắpHetHan ? '#e53e3e' : '#38a169', fontSize:12}}>
                                  {sắpHetHan ? '⚠️ ' : ''}{new Date(xe.ngay_dang_kiem_tiep_theo).toLocaleDateString('vi-VN')}
                                </span>
                              : '—'}
                          </td>
                          <td><span className={`badge ${tt.cls}`}>{tt.label}</span></td>
                          <td>
                            <div className="action-cell">
                              <button className="btn btn-info btn-sm" onClick={() => openDetail(xe)}>👁️</button>
                              <button className="btn btn-warning btn-sm" onClick={() => openEdit(xe)}>✏️</button>
                              <select className="btn btn-outline btn-sm" style={{padding:'4px 6px',cursor:'pointer'}}
                                value={xe.trang_thai}
                                onChange={e => handleTrangThai(xe.id, e.target.value)}>
                                {Object.entries(TRANG_THAI_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(xe.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Báo lỗi */}
      {tab === 'bao_loi' && (
        <div className="card">
          <div className="card-header" style={{display:'flex',alignItems:'center',gap:12}}>
            <h3>⚠️ Báo Lỗi Xe ({baoLoiList.length})</h3>
            <select className="search-input" style={{maxWidth:180}} value={filterBL} onChange={e=>setFilterBL(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(XLTT_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="card-body" style={{padding:0}}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Xe</th><th>Giảng viên</th><th>Tiêu đề</th><th>Mức độ</th><th>Trạng thái</th><th>Ngày báo</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {baoLoiList.length === 0
                  ? <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>Không có báo lỗi nào</td></tr>
                  : baoLoiList.map((bl, i) => (
                    <tr key={bl.id}>
                      <td>{i+1}</td>
                      <td><strong style={{color:'#0d47a1'}}>{bl.xe?.bien_so}</strong><br/><span style={{fontSize:11,color:'#718096'}}>{bl.xe?.hang_xe}</span></td>
                      <td>{bl.giang_vien?.user?.ho_ten || '—'}</td>
                      <td style={{maxWidth:200}}>
                        <p style={{fontWeight:600,fontSize:13}}>{bl.tieu_de}</p>
                        <p style={{fontSize:11,color:'#718096',marginTop:2}}>{bl.mo_ta?.slice(0,60)}{bl.mo_ta?.length>60?'...':''}</p>
                      </td>
                      <td><span className={`badge ${MUC_DO_MAP[bl.muc_do]?.cls}`}>{MUC_DO_MAP[bl.muc_do]?.label}</span></td>
                      <td><span className={`badge ${XLTT_MAP[bl.trang_thai]?.cls}`}>{XLTT_MAP[bl.trang_thai]?.label}</span></td>
                      <td style={{fontSize:12}}>{new Date(bl.created_at).toLocaleDateString('vi-VN')}</td>
                      <td>
                        {bl.trang_thai !== 'da_xu_ly' && (
                          <button className="btn btn-primary btn-sm" onClick={() => { setShowXuLy(bl); setXuLyForm({ trang_thai:'dang_xu_ly', ghi_chu_xu_ly: bl.ghi_chu_xu_ly||'' }) }}>
                            🔧 Xử lý
                          </button>
                        )}
                        {bl.trang_thai === 'da_xu_ly' && <span style={{fontSize:12,color:'#38a169'}}>✅ Hoàn tất</span>}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa xe */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Cập Nhật Xe' : '🚗 Thêm Xe Mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="xe-form-grid">
                  <div className="form-group"><label>Biển số *</label><input value={form.bien_so} onChange={e=>setForm({...form,bien_so:e.target.value.toUpperCase()})} placeholder="VD: 51A-12345" required /></div>
                  <div className="form-group"><label>Hãng xe *</label><input value={form.hang_xe} onChange={e=>setForm({...form,hang_xe:e.target.value})} placeholder="Toyota, Kia, Honda..." required /></div>
                  <div className="form-group"><label>Dòng xe</label><input value={form.dong_xe} onChange={e=>setForm({...form,dong_xe:e.target.value})} placeholder="Vios, Morning, City..." /></div>
                  <div className="form-group"><label>Năm sản xuất</label><input type="number" min={1990} max={2030} value={form.nam_san_xuat} onChange={e=>setForm({...form,nam_san_xuat:e.target.value})} /></div>
                  <div className="form-group"><label>Loại xe *</label>
                    <select value={form.loai_xe} onChange={e=>setForm({...form,loai_xe:e.target.value})}>
                      <option value="so_san">Số sàn</option>
                      <option value="so_tu_dong">Số tự động</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Hạng bằng *</label>
                    <select value={form.hang_bang} onChange={e=>setForm({...form,hang_bang:e.target.value})}>
                      {['A1','A2','B1','B2','C','D','E'].map(h => <option key={h} value={h}>Hạng {h}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Màu xe</label><input value={form.mau_xe} onChange={e=>setForm({...form,mau_xe:e.target.value})} placeholder="Trắng, Đen, Bạc..." /></div>
                  <div className="form-group"><label>Km hiện tại</label><input type="number" min={0} value={form.so_km_hien_tai} onChange={e=>setForm({...form,so_km_hien_tai:e.target.value})} /></div>
                  <div className="form-group"><label>Ngày đăng kiểm</label><input type="date" value={form.ngay_dang_kiem} onChange={e=>setForm({...form,ngay_dang_kiem:e.target.value})} /></div>
                  <div className="form-group"><label>Đăng kiểm tiếp theo</label><input type="date" value={form.ngay_dang_kiem_tiep_theo} onChange={e=>setForm({...form,ngay_dang_kiem_tiep_theo:e.target.value})} /></div>
                  <div className="form-group"><label>Ngày bảo hiểm</label><input type="date" value={form.ngay_bao_hiem} onChange={e=>setForm({...form,ngay_bao_hiem:e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Ghi chú</label><textarea rows={2} value={form.ghi_chu} onChange={e=>setForm({...form,ghi_chu:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Cập nhật' : 'Thêm xe'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết xe */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚗 Chi Tiết Xe — {showDetail.bien_so}</h3>
              <button className="modal-close" onClick={() => setShowDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="xe-detail-grid">
                {[
                  ['Biển số', showDetail.bien_so],
                  ['Hãng xe', showDetail.hang_xe],
                  ['Dòng xe', showDetail.dong_xe || '—'],
                  ['Năm SX', showDetail.nam_san_xuat || '—'],
                  ['Loại xe', LOAI_XE_MAP[showDetail.loai_xe]],
                  ['Hạng bằng', `Hạng ${showDetail.hang_bang}`],
                  ['Màu xe', showDetail.mau_xe || '—'],
                  ['Km hiện tại', `${showDetail.so_km_hien_tai?.toLocaleString()} km`],
                  ['Đăng kiểm', showDetail.ngay_dang_kiem ? new Date(showDetail.ngay_dang_kiem).toLocaleDateString('vi-VN') : '—'],
                  ['Đăng kiểm tiếp', showDetail.ngay_dang_kiem_tiep_theo ? new Date(showDetail.ngay_dang_kiem_tiep_theo).toLocaleDateString('vi-VN') : '—'],
                  ['Bảo hiểm', showDetail.ngay_bao_hiem ? new Date(showDetail.ngay_bao_hiem).toLocaleDateString('vi-VN') : '—'],
                ].map(([k,v],i) => (
                  <div key={i} className="xe-detail-item">
                    <span className="xdi-label">{k}</span>
                    <span className="xdi-value">{v}</span>
                  </div>
                ))}
              </div>

              {showDetail.bao_loi?.length > 0 && (
                <div style={{marginTop:20}}>
                  <h4 style={{marginBottom:10,color:'#e53e3e'}}>⚠️ Lịch sử báo lỗi ({showDetail.bao_loi.length})</h4>
                  {showDetail.bao_loi.map(bl => (
                    <div key={bl.id} className="xe-bao-loi-item">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <strong>{bl.tieu_de}</strong>
                        <span className={`badge ${MUC_DO_MAP[bl.muc_do]?.cls}`}>{MUC_DO_MAP[bl.muc_do]?.label}</span>
                      </div>
                      <p style={{fontSize:12,color:'#718096',marginTop:4}}>{bl.mo_ta}</p>
                      <p style={{fontSize:11,color:'#a0aec0',marginTop:2}}>GV: {bl.giang_vien?.user?.ho_ten} — {new Date(bl.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xử lý báo lỗi */}
      {showXuLy && (
        <div className="modal-overlay" onClick={() => setShowXuLy(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔧 Xử Lý Báo Lỗi</h3>
              <button className="modal-close" onClick={() => setShowXuLy(null)}>✕</button>
            </div>
            <form onSubmit={handleXuLy}>
              <div className="modal-body">
                <div className="xe-bao-loi-item" style={{marginBottom:16}}>
                  <strong>{showXuLy.tieu_de}</strong>
                  <p style={{fontSize:13,marginTop:4}}>{showXuLy.mo_ta}</p>
                  <p style={{fontSize:12,color:'#718096',marginTop:4}}>Xe: <strong>{showXuLy.xe?.bien_so}</strong> — GV: {showXuLy.giang_vien?.user?.ho_ten}</p>
                </div>
                <div className="form-group"><label>Trạng thái xử lý *</label>
                  <select value={xuLyForm.trang_thai} onChange={e=>setXuLyForm({...xuLyForm,trang_thai:e.target.value})}>
                    <option value="dang_xu_ly">🔧 Đang xử lý</option>
                    <option value="da_xu_ly">✅ Đã xử lý xong</option>
                  </select>
                </div>
                <div className="form-group"><label>Ghi chú xử lý</label>
                  <textarea rows={3} value={xuLyForm.ghi_chu_xu_ly} onChange={e=>setXuLyForm({...xuLyForm,ghi_chu_xu_ly:e.target.value})} placeholder="Mô tả cách xử lý, thay thế linh kiện..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowXuLy(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default XeManagement
