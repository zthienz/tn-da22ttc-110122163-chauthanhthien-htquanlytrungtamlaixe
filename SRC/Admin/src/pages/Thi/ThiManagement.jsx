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
  const [selectedLich, setSelectedLich] = useState(null)
  const [kqData, setKqData]     = useState([])
  const [baiThiList, setBaiThiList] = useState([])
  const [form, setForm] = useState({ khoa_hoc_id:'', loai_thi:'tot_nghiep', ngay_thi:'', gio_thi:'', dia_diem:'', don_vi_to_chuc:'' })
  const [khoaList, setKhoaList] = useState([])
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

  const handleTaoLichThi = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/lich-thi`, form, { headers })
      if (res.data.success) { toast.success('Tạo lịch thi thành công!'); setShowModal(false); fetchAll() }
      else toast.error(res.data.message)
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

  return (
    <div className="thi-page">
      <div className="page-header">
        <div><h2>🏆 Thi & Kết Quả</h2><p>Quản lý lịch thi tốt nghiệp và sát hạch</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ khoa_hoc_id:'', loai_thi:'tot_nghiep', ngay_thi:'', gio_thi:'', dia_diem:'', don_vi_to_chuc:'' }); setShowModal(true) }}>
          + Tạo lịch thi
        </button>
      </div>

      {/* Tabs */}
      <div className="thi-tabs">
        <button className={`thi-tab ${tab==='lich'?'active':''}`} onClick={() => setTab('lich')}>📅 Lịch Thi</button>
        <button className={`thi-tab ${tab==='ket_qua'?'active':''}`} onClick={() => setTab('ket_qua')}>📊 Kết Quả</button>
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
                {lichThi.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>Chưa có lịch thi nào</td></tr>
                ) : lichThi.map((lt, i) => {
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Tạo Lịch Thi</h3>
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
                <button type="submit" className="btn btn-primary">Tạo lịch thi</button>
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
    </div>
  )
}

export default ThiManagement
