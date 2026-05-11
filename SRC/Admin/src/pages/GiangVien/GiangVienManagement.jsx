import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'

const GiangVienManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ho_ten:'', email:'', password:'', so_dien_thoai:'', chuyen_mon:'ca_hai', bang_cap:'', nam_kinh_nghiem:0 })
  const headers = { Authorization: `Bearer ${token}` }

  const fetch = async () => {
    setLoading(true)
    const res = await axios.get(`${backendUrl}/api/admin/giang-vien`, { headers })
    if (res.data.success) setList(res.data.data)
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])

  const handleSave = async e => {
    e.preventDefault()
    try {
      const res = await axios.post(`${backendUrl}/api/admin/giang-vien`, form, { headers })
      if (res.data.success) { toast.success('Tạo tài khoản giảng viên thành công!'); setShowModal(false); fetch() }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleToggle = async (userId) => {
    const res = await axios.patch(`${backendUrl}/api/admin/users/${userId}/toggle`, {}, { headers })
    if (res.data.success) { toast.success(res.data.message); fetch() }
  }

  const CM_MAP = { ly_thuyet:'📖 Lý thuyết', thuc_hanh:'🚗 Thực hành', ca_hai:'📖🚗 Cả hai' }

  return (
    <div>
      <div className="page-header">
        <div><h2>👨‍🏫 Giảng Viên</h2><p>Quản lý tài khoản giảng viên</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ ho_ten:'', email:'', password:'', so_dien_thoai:'', chuyen_mon:'ca_hai', bang_cap:'', nam_kinh_nghiem:0 }); setShowModal(true) }}>
          + Thêm giảng viên
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Chuyên môn</th><th>Bằng cấp</th><th>Kinh nghiệm</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:'40px',color:'#a0aec0'}}>Chưa có giảng viên nào</td></tr>
                ) : list.map((gv, i) => (
                  <tr key={gv.id}>
                    <td>{i+1}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:'50%',background:'#0d47a1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14,flexShrink:0}}>
                          {gv.ho_ten?.charAt(0).toUpperCase()}
                        </div>
                        <strong>{gv.ho_ten}</strong>
                      </div>
                    </td>
                    <td style={{fontSize:12}}>{gv.email}</td>
                    <td>{gv.so_dien_thoai || '—'}</td>
                    <td><span className="badge badge-info">{CM_MAP[gv.chuyen_mon] || gv.chuyen_mon}</span></td>
                    <td style={{fontSize:12}}>{gv.bang_cap || '—'}</td>
                    <td>{gv.nam_kinh_nghiem} năm</td>
                    <td>
                      <span className={`badge ${gv.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {gv.is_active ? '✅ Hoạt động' : '❌ Vô hiệu'}
                      </span>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${gv.is_active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggle(gv.user_id)}>
                        {gv.is_active ? '🔒 Khóa' : '🔓 Mở'}
                      </button>
                    </td>
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
              <h3>👨‍🏫 Thêm Giảng Viên</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="form-group"><label>Họ và tên *</label><input value={form.ho_ten} onChange={e=>setForm({...form,ho_ten:e.target.value})} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                  <div className="form-group"><label>Mật khẩu *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} /></div>
                  <div className="form-group"><label>Số điện thoại</label><input value={form.so_dien_thoai} onChange={e=>setForm({...form,so_dien_thoai:e.target.value})} /></div>
                  <div className="form-group"><label>Chuyên môn *</label>
                    <select value={form.chuyen_mon} onChange={e=>setForm({...form,chuyen_mon:e.target.value})}>
                      <option value="ly_thuyet">📖 Lý thuyết</option>
                      <option value="thuc_hanh">🚗 Thực hành</option>
                      <option value="ca_hai">📖🚗 Cả hai</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Năm kinh nghiệm</label><input type="number" min={0} value={form.nam_kinh_nghiem} onChange={e=>setForm({...form,nam_kinh_nghiem:e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Bằng cấp</label><input value={form.bang_cap} onChange={e=>setForm({...form,bang_cap:e.target.value})} placeholder="VD: Bằng lái hạng C, Cử nhân Luật GT" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GiangVienManagement
