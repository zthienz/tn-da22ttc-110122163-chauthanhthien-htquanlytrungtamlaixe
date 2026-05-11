import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './LichHocManagement.css'

const DAYS = ['CN','T2','T3','T4','T5','T6','T7']
const fmt  = d => new Date(d).toISOString().split('T')[0]

const getWeekDates = base => {
  const d   = new Date(base)
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({length:7}, (_,i) => { const dt = new Date(mon); dt.setDate(mon.getDate()+i); return dt })
}

const LichHocManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [lichHoc, setLichHoc]   = useState([])
  const [lopList, setLopList]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [base, setBase]         = useState(new Date())
  const [filterLop, setFilterLop] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDiemDanhModal, setShowDiemDanhModal] = useState(false)
  const [selectedLich, setSelectedLich] = useState(null)
  const [diemDanhData, setDiemDanhData] = useState([])
  const [xeList, setXeList] = useState([])
  const [form, setForm] = useState({ lop_hoc_id:'', ngay_hoc:'', gio_bat_dau:'', gio_ket_thuc:'', loai_buoi:'ly_thuyet', dia_diem:'', noi_dung:'', xe_id:'' })
  const headers = { Authorization: `Bearer ${token}` }

  const weekDates = getWeekDates(base)
  const fromDate  = fmt(weekDates[0])
  const toDate    = fmt(weekDates[6])

  const fetchLich = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lich-hoc`, {
        headers, params: { from: fromDate, to: toDate, lop_hoc_id: filterLop }
      })
      if (res.data.success) setLichHoc(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    axios.get(`${backendUrl}/api/admin/lop-hoc`, { headers })
      .then(r => { if (r.data.success) setLopList(r.data.data) })
    axios.get(`${backendUrl}/api/admin/xe`, { headers })
      .then(r => { if (r.data.success) setXeList(r.data.data.filter(x => ['san_sang','dang_su_dung'].includes(x.trang_thai))) })
  }, [])

  useEffect(() => { fetchLich() }, [fromDate, toDate, filterLop])

  const getLichByDate = date => lichHoc.filter(l => l.ngay_hoc === fmt(date))
  const isToday = date => fmt(date) === fmt(new Date())

  const handleSave = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/lich-hoc`, form, { headers })
      if (res.data.success) { toast.success('Tạo lịch học thành công!'); setShowModal(false); fetchLich() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleDelete = async id => {
    if (!confirm('Xóa buổi học này?')) return
    const res = await axios.delete(`${backendUrl}/api/admin/lich-hoc/${id}`, { headers })
    if (res.data.success) { toast.success('Đã xóa'); fetchLich() }
  }

  const openDiemDanh = async lich => {
    setSelectedLich(lich)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lich-hoc/${lich.id}/diem-danh`, { headers })
      if (res.data.success) setDiemDanhData(res.data.data.map(d => ({ ...d, co_mat: d.co_mat || false, km_chay: d.km_chay || '' })))
    } catch {}
    setShowDiemDanhModal(true)
  }

  const handleSaveDiemDanh = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/admin/lich-hoc/${selectedLich.id}/diem-danh`, {
        diem_danh: diemDanhData.map(d => ({ ho_so_id: d.ho_so_id, co_mat: d.co_mat, km_chay: d.km_chay || null }))
      }, { headers })
      if (res.data.success) { toast.success('Điểm danh thành công!'); setShowDiemDanhModal(false) }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  return (
    <div className="lich-page">
      <div className="page-header">
        <div><h2>📅 Lịch Học</h2><p>Quản lý lịch học theo tuần</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ lop_hoc_id:'', ngay_hoc:'', gio_bat_dau:'', gio_ket_thuc:'', loai_buoi:'ly_thuyet', dia_diem:'', noi_dung:'', xe_id:'' }); setShowModal(true) }}>
          + Tạo buổi học
        </button>
      </div>

      {/* Filter + Nav tuần */}
      <div className="lich-toolbar">
        <select className="search-input" style={{maxWidth:240}} value={filterLop} onChange={e => setFilterLop(e.target.value)}>
          <option value="">Tất cả lớp học</option>
          {lopList.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
        </select>
        <div className="week-nav">
          <button className="btn btn-outline btn-sm" onClick={() => { const d=new Date(base); d.setDate(d.getDate()-7); setBase(d) }}>‹ Tuần trước</button>
          <span className="week-label">
            {weekDates[0].getDate()}/{weekDates[0].getMonth()+1} — {weekDates[6].getDate()}/{weekDates[6].getMonth()+1}/{weekDates[6].getFullYear()}
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => setBase(new Date())}>Hôm nay</button>
          <button className="btn btn-outline btn-sm" onClick={() => { const d=new Date(base); d.setDate(d.getDate()+7); setBase(d) }}>Tuần sau ›</button>
        </div>
      </div>

      {/* Lịch tuần */}
      {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
        <div className="week-grid">
          {weekDates.map((date, i) => {
            const items = getLichByDate(date)
            return (
              <div key={i} className={`week-col ${isToday(date) ? 'today' : ''}`}>
                <div className="week-col-header">
                  <span className="wch-day">{DAYS[date.getDay()]}</span>
                  <span className={`wch-num ${isToday(date) ? 'today-num' : ''}`}>{date.getDate()}</span>
                </div>
                <div className="week-col-body">
                  {items.map(lh => (
                    <div key={lh.id} className={`lich-event ${lh.loai_buoi}`}>
                      <p className="le-time">{lh.gio_bat_dau?.slice(0,5)}–{lh.gio_ket_thuc?.slice(0,5)}</p>
                      <p className="le-lop">{lh.lop_hoc?.ten_lop}</p>
                      <p className="le-type">{lh.loai_buoi === 'ly_thuyet' ? '📖 LT' : '🚗 TH'}</p>
                      {lh.xe && <p className="le-xe">🚗 {lh.xe?.bien_so}</p>}
                      <div className="le-actions">
                        <button className="le-btn" onClick={() => openDiemDanh(lh)}>✅ ĐD</button>
                        <button className="le-btn le-del" onClick={() => handleDelete(lh.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Danh sách buổi học trong tuần */}
      <div className="card">
        <div className="card-header"><h3>📋 Danh Sách Buổi Học Trong Tuần</h3></div>
        <div className="card-body" style={{padding:0}}>
          <table className="data-table">
            <thead><tr><th>Ngày</th><th>Lớp</th><th>Loại</th><th>Giờ</th><th>Địa điểm</th><th>Thao tác</th></tr></thead>
            <tbody>
              {lichHoc.length === 0
                ? <tr><td colSpan={6} style={{textAlign:'center',padding:'32px',color:'#a0aec0'}}>Không có buổi học nào trong tuần này</td></tr>
                : lichHoc.map(lh => (
                  <tr key={lh.id}>
                    <td>{new Date(lh.ngay_hoc).toLocaleDateString('vi-VN')}</td>
                    <td><strong>{lh.lop_hoc?.ten_lop}</strong></td>
                    <td><span className={`badge ${lh.loai_buoi === 'ly_thuyet' ? 'badge-info' : 'badge-success'}`}>
                      {lh.loai_buoi === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}
                    </span></td>
                    <td>{lh.gio_bat_dau?.slice(0,5)} – {lh.gio_ket_thuc?.slice(0,5)}</td>
                    <td>{lh.dia_diem || '—'}</td>
                    <td><div className="action-cell">
                      <button className="btn btn-success btn-sm" onClick={() => openDiemDanh(lh)}>✅ Điểm danh</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lh.id)}>🗑️</button>
                    </div></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tạo buổi học */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Tạo Buổi Học</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label>Lớp học *</label>
                  <select value={form.lop_hoc_id} onChange={e=>setForm({...form,lop_hoc_id:e.target.value})} required>
                    <option value="">-- Chọn lớp --</option>
                    {lopList.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>Ngày học *</label><input type="date" value={form.ngay_hoc} onChange={e=>setForm({...form,ngay_hoc:e.target.value})} required /></div>
                  <div className="form-group"><label>Loại buổi *</label>
                    <select value={form.loai_buoi} onChange={e=>setForm({...form,loai_buoi:e.target.value})}>
                      <option value="ly_thuyet">📖 Lý thuyết</option>
                      <option value="thuc_hanh">🚗 Thực hành</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Giờ bắt đầu *</label><input type="time" value={form.gio_bat_dau} onChange={e=>setForm({...form,gio_bat_dau:e.target.value})} required /></div>
                  <div className="form-group"><label>Giờ kết thúc *</label><input type="time" value={form.gio_ket_thuc} onChange={e=>setForm({...form,gio_ket_thuc:e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Địa điểm</label><input value={form.dia_diem} onChange={e=>setForm({...form,dia_diem:e.target.value})} placeholder="VD: Phòng 101, Sân tập A" /></div>
                {form.loai_buoi === 'thuc_hanh' && (
                  <div className="form-group"><label>🚗 Phân xe thực hành</label>
                    <select value={form.xe_id} onChange={e=>setForm({...form,xe_id:e.target.value})}>
                      <option value="">-- Chưa phân xe --</option>
                      {xeList.map(x => <option key={x.id} value={x.id}>{x.bien_so} — {x.hang_xe} {x.dong_xe} (Hạng {x.hang_bang})</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group"><label>Nội dung buổi học</label><textarea rows={2} value={form.noi_dung} onChange={e=>setForm({...form,noi_dung:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo buổi học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal điểm danh */}
      {showDiemDanhModal && selectedLich && (
        <div className="modal-overlay" onClick={() => setShowDiemDanhModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>✅ Điểm Danh — {selectedLich.lop_hoc?.ten_lop}</h3>
                <p style={{fontSize:12,color:'#718096',marginTop:3}}>
                  {new Date(selectedLich.ngay_hoc).toLocaleDateString('vi-VN')} | {selectedLich.gio_bat_dau?.slice(0,5)}–{selectedLich.gio_ket_thuc?.slice(0,5)} |
                  {selectedLich.loai_buoi === 'ly_thuyet' ? ' 📖 Lý thuyết' : ' 🚗 Thực hành'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowDiemDanhModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {diemDanhData.length === 0 ? (
                <div className="empty-state"><span>👥</span><p>Chưa có học viên trong lớp này</p></div>
              ) : (
                <>
                  <div className="dd-toolbar">
                    <button className="btn btn-success btn-sm" onClick={() => setDiemDanhData(diemDanhData.map(d => ({...d, co_mat: true})))}>
                      ✅ Điểm danh tất cả
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setDiemDanhData(diemDanhData.map(d => ({...d, co_mat: false})))}>
                      ❌ Bỏ chọn tất cả
                    </button>
                    <span className="dd-count">
                      {diemDanhData.filter(d => d.co_mat).length}/{diemDanhData.length} có mặt
                    </span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Học viên</th>
                        <th style={{textAlign:'center'}}>Có mặt</th>
                        {selectedLich.loai_buoi === 'thuc_hanh' && <th>Km chạy được</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {diemDanhData.map((d, i) => (
                        <tr key={i} className={d.co_mat ? 'dd-present' : ''}>
                          <td>
                            <div className="dd-hv-info">
                              <div className="dd-avatar">{d.ho_ten?.charAt(0).toUpperCase()}</div>
                              <div>
                                <p style={{fontWeight:700,fontSize:14}}>{d.ho_ten}</p>
                                <p style={{fontSize:12,color:'#718096'}}>{d.so_cccd}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{textAlign:'center'}}>
                            <label className="dd-toggle">
                              <input type="checkbox" checked={d.co_mat}
                                onChange={e => setDiemDanhData(diemDanhData.map((x,j) => j===i ? {...x, co_mat: e.target.checked} : x))} />
                              <span className="dd-toggle-slider" />
                            </label>
                          </td>
                          {selectedLich.loai_buoi === 'thuc_hanh' && (
                            <td>
                              <input type="number" step="0.1" min="0" value={d.km_chay}
                                onChange={e => setDiemDanhData(diemDanhData.map((x,j) => j===i ? {...x, km_chay: e.target.value} : x))}
                                placeholder="0.0 km" className="km-input"
                                disabled={!d.co_mat} />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDiemDanhModal(false)}>Hủy</button>
              <button className="btn btn-success" onClick={handleSaveDiemDanh}>💾 Lưu điểm danh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LichHocManagement
