import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'

const LopHocManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [khoaList, setKhoaList] = useState([])
  const [gvList, setGvList]   = useState([])
  const [form, setForm] = useState({ ten_lop:'', khoa_hoc_id:'', giang_vien_ly_thuyet_id:'', giang_vien_thuc_hanh_id:'', ngay_khai_giang:'', si_so_toi_da:30 })
  const headers = { Authorization: `Bearer ${token}` }

  const fetch = async () => {
    setLoading(true)
    const [r1, r2, r3] = await Promise.all([
      axios.get(`${backendUrl}/api/admin/lop-hoc`, { headers }),
      axios.get(`${backendUrl}/api/admin/khoa-hoc`, { headers }),
      axios.get(`${backendUrl}/api/admin/giang-vien`, { headers }),
    ])
    if (r1.data.success) setList(r1.data.data)
    if (r2.data.success) setKhoaList(r2.data.data)
    if (r3.data.success) setGvList(r3.data.data)
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const handleSave = async e => {
    e.preventDefault()
    try {
      const res = editing
        ? await axios.put(`${backendUrl}/api/admin/lop-hoc/${editing.id}`, form, { headers })
        : await axios.post(`${backendUrl}/api/admin/lop-hoc`, form, { headers })
      if (res.data.success) { toast.success('Thành công!'); setShowModal(false); fetch() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const TS_MAP = { chuan_bi:'badge-info', dang_hoc:'badge-success', da_ket_thuc:'badge-gray' }
  const TS_LABEL = { chuan_bi:'Chuẩn bị', dang_hoc:'Đang học', da_ket_thuc:'Kết thúc' }

  return (
    <div>
      <div className="page-header">
        <div><h2>🏫 Lớp Học</h2><p>Quản lý các lớp học và phân công giảng viên</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ ten_lop:'', khoa_hoc_id:'', giang_vien_ly_thuyet_id:'', giang_vien_thuc_hanh_id:'', ngay_khai_giang:'', si_so_toi_da:30 }); setShowModal(true) }}>+ Tạo lớp học</button>
      </div>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Tên lớp</th><th>Khóa học</th><th>GV Lý thuyết</th><th>GV Thực hành</th><th>Khai giảng</th><th>Sĩ số</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {list.map((l,i) => (
                  <tr key={l.id}>
                    <td>{i+1}</td>
                    <td><strong>{l.ten_lop}</strong></td>
                    <td>{l.khoa_hoc?.ten_khoa}</td>
                    <td>{l.giang_vien_ly_thuyet?.user?.ho_ten || '—'}</td>
                    <td>{l.giang_vien_thuc_hanh?.user?.ho_ten || '—'}</td>
                    <td>{l.ngay_khai_giang || '—'}</td>
                    <td>{l.hoc_vien_count || 0}/{l.si_so_toi_da}</td>
                    <td><span className={`badge ${TS_MAP[l.trang_thai]||'badge-gray'}`}>{TS_LABEL[l.trang_thai]||l.trang_thai}</span></td>
                    <td><div className="action-cell">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditing(l); setForm({ten_lop:l.ten_lop,khoa_hoc_id:l.khoa_hoc_id,giang_vien_ly_thuyet_id:l.giang_vien_ly_thuyet_id||'',giang_vien_thuc_hanh_id:l.giang_vien_thuc_hanh_id||'',ngay_khai_giang:l.ngay_khai_giang||'',si_so_toi_da:l.si_so_toi_da}); setShowModal(true) }}>✏️</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Sửa lớp học' : 'Tạo lớp học mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label>Tên lớp *</label><input value={form.ten_lop} onChange={e=>setForm({...form,ten_lop:e.target.value})} required placeholder="VD: B2-2025-01" /></div>
                <div className="form-group"><label>Khóa học *</label>
                  <select value={form.khoa_hoc_id} onChange={e=>setForm({...form,khoa_hoc_id:e.target.value})} required>
                    <option value="">-- Chọn khóa học --</option>
                    {khoaList.map(k => <option key={k.id} value={k.id}>{k.ten_khoa}</option>)}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>GV Lý thuyết</label>
                    <select value={form.giang_vien_ly_thuyet_id} onChange={e=>setForm({...form,giang_vien_ly_thuyet_id:e.target.value})}>
                      <option value="">-- Chọn GV --</option>
                      {gvList.filter(g => g.chuyen_mon !== 'thuc_hanh').map(g => <option key={g.id} value={g.id}>{g.ho_ten}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>GV Thực hành</label>
                    <select value={form.giang_vien_thuc_hanh_id} onChange={e=>setForm({...form,giang_vien_thuc_hanh_id:e.target.value})}>
                      <option value="">-- Chọn GV --</option>
                      {gvList.filter(g => g.chuyen_mon !== 'ly_thuyet').map(g => <option key={g.id} value={g.id}>{g.ho_ten}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Ngày khai giảng</label><input type="date" value={form.ngay_khai_giang} onChange={e=>setForm({...form,ngay_khai_giang:e.target.value})} /></div>
                  <div className="form-group"><label>Sĩ số tối đa</label><input type="number" value={form.si_so_toi_da} onChange={e=>setForm({...form,si_so_toi_da:e.target.value})} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Tạo lớp'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default LopHocManagement
