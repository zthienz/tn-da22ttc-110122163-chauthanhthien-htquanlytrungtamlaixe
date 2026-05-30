import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './ThiManagement.css'

const ThiManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [lichThi, setLichThi]   = useState([])
  const [lopList, setLopList]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('lich') // 'lich' | 'ket_qua'
  const [showModal, setShowModal]   = useState(false)
  const [showKQModal, setShowKQModal] = useState(false)
  const [viewItem, setViewItem]     = useState(null)
  const [selectedLich, setSelectedLich] = useState(null)
  const [kqData, setKqData]     = useState([])
  const [baiThiList, setBaiThiList] = useState([])
  const [form, setForm] = useState({ khoa_hoc_id:'', loai_thi:'tot_nghiep', ngay_thi:'', gio_thi:'', dia_diem:'', don_vi_to_chuc:'' })
  const [khoaList, setKhoaList] = useState([])
  const [search, setSearch]     = useState('')
  const [filterLoai, setFilterLoai] = useState('')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/lich-thi`, { headers }),
        axios.get(`${backendUrl}/api/admin/lop-hoc`, { headers }),
        axios.get(`${backendUrl}/api/admin/khoa-hoc`, { headers }),
      ])
      if (r1.data.success) setLichThi(r1.data.data)
      if (r2.data.success) setLopList(r2.data.data)
      if (r3.data.success) setKhoaList(r3.data.data)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { fetchAll() }, [])

  const [editingThi, setEditingThi] = useState(null)

  const openEditThi = (lt) => {
    setEditingThi(lt)
    setForm({
      khoa_hoc_id:     lt.khoa_hoc_id || '',
      loai_thi:        lt.loai_thi || 'tot_nghiep',
      ngay_thi:        lt.ngay_thi?.split('T')[0] || '',
      gio_thi:         lt.gio_thi?.slice(0,5) || '',
      dia_diem:        lt.dia_diem || '',
      don_vi_to_chuc:  lt.don_vi_to_chuc || '',
    })
    setShowModal(true)
  }

  const handleTaoLichThi = async e => {
    e.preventDefault()
    try {
      const res = editingThi
        ? await axios.put(`${backendUrl}/api/admin/lich-thi/${editingThi.id}`, form, { headers })
        : await axios.post(`${backendUrl}/api/admin/lich-thi`, form, { headers })
      if (res.data.success) {
        toast.success(editingThi ? 'Cập nhật lịch thi thành công!' : 'Tạo lịch thi thành công!')
        setShowModal(false)
        setEditingThi(null)
        fetchAll()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const openNhapKQ = async lich => {
    setSelectedLich(lich)
    // Lấy danh sách học viên trong lớp + bài thi
    try {
      const lopId = lich.khoa_hoc_id
      const res = await axios.get(`${backendUrl}/api/admin/khoa-hoc`, { headers })
      const khoa = res.data.data?.find(k => k.id === lich.khoa_hoc_id)
      // Lấy bài thi theo loại
      const baiThi = khoa?.bai_thi?.filter(b => b.loai === lich.loai_thi) || []
      setBaiThiList(baiThi)
      // Lấy học viên đủ điều kiện (mock — sẽ kết nối API thực)
      setKqData([])
    } catch {}
    setShowKQModal(true)
  }

  const handleSaveKQ = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/admin/lich-thi/${selectedLich.id}/ket-qua`, {
        ket_qua: kqData
      }, { headers })
      if (res.data.success) { toast.success('Nhập kết quả thành công!'); setShowKQModal(false) }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const LOAI_MAP = { tot_nghiep: { text:'Tốt nghiệp', cls:'badge-blue' }, sat_hanh: { text:'Sát hạch', cls:'badge-purple' } }

  const filteredThi = lichThi.filter(lt => {
    const matchSearch = !search ||
      lt.khoa_hoc?.ten_khoa?.toLowerCase().includes(search.toLowerCase()) ||
      lt.dia_diem?.toLowerCase().includes(search.toLowerCase()) ||
      lt.don_vi_to_chuc?.toLowerCase().includes(search.toLowerCase())
    const matchLoai = !filterLoai || lt.loai_thi === filterLoai
    return matchSearch && matchLoai
  })

  return (
    <div className="thi-page">
      <div className="page-header">
        <div><h2>🏆 Thi & Kết Quả</h2><p>Quản lý lịch thi tốt nghiệp và sát hạch</p></div>
        <button className="btn btn-primary" onClick={() => { setEditingThi(null); setForm({ khoa_hoc_id:'', loai_thi:'tot_nghiep', ngay_thi:'', gio_thi:'', dia_diem:'', don_vi_to_chuc:'' }); setShowModal(true) }}>
          + Tạo lịch thi
        </button>
      </div>

      {/* Tabs */}
      <div className="thi-tabs">
        <button className={`thi-tab ${tab==='lich'?'active':''}`} onClick={() => setTab('lich')}>📅 Lịch Thi</button>
        <button className={`thi-tab ${tab==='ket_qua'?'active':''}`} onClick={() => setTab('ket_qua')}>📊 Kết Quả</button>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Tìm theo khóa học, địa điểm, đơn vị tổ chức..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" style={{maxWidth:200}} value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="">Tất cả loại thi</option>
          <option value="tot_nghiep">🎓 Tốt nghiệp</option>
          <option value="sat_hanh">🏛️ Sát hạch (BCA)</option>
        </select>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
        <div className="card">
          <div className="card-body" style={{padding:0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Ngày thi</th><th>Giờ</th><th>Loại thi</th>
                  <th>Khóa học</th><th>Địa điểm</th>
                  {tab === 'lich' && <th>Đơn vị tổ chức</th>}
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredThi.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>
                    {search || filterLoai ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch thi nào'}
                  </td></tr>
                ) : filteredThi.map((lt, i) => {
                  const lm = LOAI_MAP[lt.loai_thi] || { text: lt.loai_thi, cls:'badge-gray' }
                  return (
                    <tr key={lt.id}>
                      <td>{i+1}</td>
                      <td><strong>{new Date(lt.ngay_thi).toLocaleDateString('vi-VN')}</strong></td>
                      <td>{lt.gio_thi?.slice(0,5)}</td>
                      <td><span className={`badge ${lm.cls}`}>{lm.text}</span></td>
                      <td>{lt.khoa_hoc?.ten_khoa || '—'}</td>
                      <td>{lt.dia_diem || '—'}</td>
                      {tab === 'lich' && <td>{lt.don_vi_to_chuc || '—'}</td>}
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-info btn-sm" onClick={() => setViewItem(lt)}>👁️ Xem</button>
                          <button className="btn btn-primary btn-sm" onClick={() => openNhapKQ(lt)}>
                            📝 Nhập KQ
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={async () => {
                            if (!confirm('Xóa lịch thi?')) return
                            const r = await axios.delete(`${backendUrl}/api/admin/lich-thi/${lt.id}`, { headers })
                            if (r.data.success) { toast.success('Đã xóa'); fetchAll() }
                          }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal tạo lịch thi */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingThi ? '✏️ Sửa Lịch Thi' : '📅 Tạo Lịch Thi'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaoLichThi}>
              <div className="modal-body">
                <div className="form-group"><label>Khóa học *</label>
                  <select value={form.khoa_hoc_id} onChange={e=>setForm({...form,khoa_hoc_id:e.target.value})} required>
                    <option value="">-- Chọn khóa học --</option>
                    {khoaList.map(k => <option key={k.id} value={k.id}>{k.ten_khoa} (Hạng {k.loai_bang})</option>)}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>Loại thi *</label>
                    <select value={form.loai_thi} onChange={e=>setForm({...form,loai_thi:e.target.value})}>
                      <option value="tot_nghiep">Tốt nghiệp</option>
                      <option value="sat_hanh">Sát hạch (BCA)</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Ngày thi *</label><input type="date" value={form.ngay_thi} onChange={e=>setForm({...form,ngay_thi:e.target.value})} required /></div>
                  <div className="form-group"><label>Giờ thi *</label><input type="time" value={form.gio_thi} onChange={e=>setForm({...form,gio_thi:e.target.value})} required /></div>
                  <div className="form-group"><label>Địa điểm</label><input value={form.dia_diem} onChange={e=>setForm({...form,dia_diem:e.target.value})} /></div>
                </div>
                {form.loai_thi === 'sat_hanh' && (
                  <div className="form-group"><label>Đơn vị tổ chức (BCA)</label>
                    <input value={form.don_vi_to_chuc} onChange={e=>setForm({...form,don_vi_to_chuc:e.target.value})} placeholder="VD: Phòng CSGT TP.HCM" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingThi ? 'Cập nhật' : 'Tạo lịch thi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nhập kết quả */}
      {showKQModal && selectedLich && (
        <div className="modal-overlay" onClick={() => setShowKQModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>📝 Nhập Kết Quả Thi</h3>
                <p style={{fontSize:12,color:'#718096',marginTop:3}}>
                  {new Date(selectedLich.ngay_thi).toLocaleDateString('vi-VN')} |
                  {selectedLich.loai_thi === 'tot_nghiep' ? ' Tốt nghiệp' : ' Sát hạch'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowKQModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {kqData.length === 0 ? (
                <div className="empty-state">
                  <span>📋</span>
                  <h3>Chưa có học viên đủ điều kiện</h3>
                  <p>Học viên cần đủ điều kiện thi mới xuất hiện ở đây</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      {baiThiList.map(b => <th key={b.id}>{b.ten_bai_thi}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {kqData.map((hv, i) => (
                      <tr key={i}>
                        <td><strong>{hv.ho_ten}</strong></td>
                        {baiThiList.map(b => (
                          <td key={b.id}>
                            <div style={{display:'flex',gap:6,alignItems:'center'}}>
                              <input type="number" step="0.1" min="0" max="100"
                                placeholder="Điểm"
                                style={{width:70,padding:'4px 8px',border:'1px solid #e2e8f0',borderRadius:6,fontSize:13}}
                                onChange={e => {
                                  const diem = parseFloat(e.target.value)
                                  const ket_qua = diem >= b.diem_dat ? 'dat' : 'khong_dat'
                                  setKqData(kqData.map((x,j) => j===i ? {...x, [`diem_${b.id}`]: diem, [`kq_${b.id}`]: ket_qua} : x))
                                }}
                              />
                              {hv[`kq_${b.id}`] && (
                                <span className={`badge ${hv[`kq_${b.id}`] === 'dat' ? 'badge-success' : 'badge-danger'}`}>
                                  {hv[`kq_${b.id}`] === 'dat' ? '✅' : '❌'}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowKQModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveKQ}>💾 Lưu kết quả</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL XEM CHI TIẾT LỊCH THI ── */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏆 Chi Tiết Lịch Thi</h3>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Header */}
              <div style={{textAlign:'center', marginBottom:20, padding:'14px', background:'#fdf4ff', borderRadius:10}}>
                <div style={{fontSize:32, marginBottom:6}}>🏆</div>
                <h2 style={{margin:0, fontSize:18}}>
                  {viewItem.loai_thi === 'tot_nghiep' ? 'Thi Tốt Nghiệp' : 'Thi Sát Hạch (BCA)'}
                </h2>
                <div style={{marginTop:8, display:'flex', gap:8, justifyContent:'center'}}>
                  {(() => {
                    const lm = LOAI_MAP[viewItem.loai_thi] || { text: viewItem.loai_thi, cls:'badge-gray' }
                    return <span className={`badge ${lm.cls}`}>{lm.text}</span>
                  })()}
                  {viewItem.khoa_hoc && <span className="badge badge-blue">Hạng {viewItem.khoa_hoc.loai_bang}</span>}
                </div>
              </div>

              {/* Thông tin lịch thi */}
              <div style={thiSectionTitle}>📋 Thông Tin Kỳ Thi</div>
              <div style={thiGrid}>
                <div style={thiBox}>
                  <div style={thiLabel}>📅 Ngày thi</div>
                  <div style={thiVal}>{new Date(viewItem.ngay_thi).toLocaleDateString('vi-VN', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
                </div>
                <div style={thiBox}>
                  <div style={thiLabel}>⏰ Giờ thi</div>
                  <div style={thiVal}>{viewItem.gio_thi?.slice(0,5) || '—'}</div>
                </div>
                <div style={thiBox}>
                  <div style={thiLabel}>📚 Khóa học</div>
                  <div style={thiVal}>{viewItem.khoa_hoc?.ten_khoa || '—'}</div>
                </div>
                <div style={thiBox}>
                  <div style={thiLabel}>📍 Địa điểm</div>
                  <div style={thiVal}>{viewItem.dia_diem || '—'}</div>
                </div>
              </div>

              {/* Đơn vị tổ chức (sát hạch) */}
              {viewItem.loai_thi === 'sat_hanh' && (
                <>
                  <div style={{...thiSectionTitle, marginTop:16}}>🏛️ Đơn Vị Tổ Chức</div>
                  <div style={thiBox}>
                    <div style={thiVal}>{viewItem.don_vi_to_chuc || <span style={{color:'#9ca3af',fontStyle:'italic'}}>Chưa cập nhật</span>}</div>
                  </div>
                </>
              )}

              {/* Ngày tạo */}
              <div style={{...thiGrid, marginTop:12}}>
                <div style={{...thiBox, background:'#f9fafb'}}>
                  <div style={thiLabel}>🗓️ Ngày tạo</div>
                  <div style={{marginTop:4, fontSize:13, color:'#6b7280'}}>{viewItem.created_at ? new Date(viewItem.created_at).toLocaleDateString('vi-VN') : '—'}</div>
                </div>
                <div style={{...thiBox, background:'#f9fafb'}}>
                  <div style={thiLabel}>🔄 Cập nhật</div>
                  <div style={{marginTop:4, fontSize:13, color:'#6b7280'}}>{viewItem.updated_at ? new Date(viewItem.updated_at).toLocaleDateString('vi-VN') : '—'}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Đóng</button>
              <button className="btn btn-primary" onClick={() => { setViewItem(null); openNhapKQ(viewItem) }}>📝 Nhập kết quả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const thiSectionTitle = { fontSize:13, fontWeight:700, color:'#6d28d9', textTransform:'uppercase', letterSpacing:'0.05em', paddingBottom:8, borderBottom:'2px solid #ede9fe', marginBottom:12 }
const thiGrid  = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }
const thiBox   = { background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:8, padding:'10px 14px' }
const thiLabel = { fontSize:11, fontWeight:600, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }
const thiVal   = { fontSize:14, fontWeight:600, color:'#111827' }

export default ThiManagement
