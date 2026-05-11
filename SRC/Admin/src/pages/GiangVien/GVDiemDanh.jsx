import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './GVDiemDanh.css'

const GVDiemDanh = () => {
  const { token, backendUrl } = useAdmin()
  const [lopList, setLopList]   = useState([])
  const [lichList, setLichList] = useState([])
  const [selectedLop, setSelectedLop] = useState('')
  const [selectedLich, setSelectedLich] = useState(null)
  const [diemDanhData, setDiemDanhData] = useState([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/lop-cua-toi`, { headers })
      .then(res => { if (res.data.success) setLopList(res.data.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedLop) return
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    axios.get(`${backendUrl}/api/giang-vien/lop/${selectedLop}/lich-hoc`, {
      headers, params: { from: today }
    })
      .then(res => { if (res.data.success) setLichList(res.data.data.slice(0,20)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedLop])

  const openDiemDanh = async lich => {
    setSelectedLich(lich)
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lich-hoc/${lich.id}/diem-danh`, { headers })
      if (res.data.success) {
        setDiemDanhData(res.data.data.map(d => ({
          ...d,
          co_mat:  d.co_mat  || false,
          km_chay: d.km_chay || '',
        })))
      }
    } catch {}
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.post(`${backendUrl}/api/admin/lich-hoc/${selectedLich.id}/diem-danh`, {
        diem_danh: diemDanhData.map(d => ({
          ho_so_id: d.ho_so_id,
          co_mat:   d.co_mat,
          km_chay:  d.km_chay || null,
        }))
      }, { headers })
      if (res.data.success) {
        toast.success('Điểm danh thành công!')
        setSelectedLich(null)
        setDiemDanhData([])
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
    setSaving(false)
  }

  const coMatCount = diemDanhData.filter(d => d.co_mat).length

  return (
    <div className="gv-diemdanh">
      <div className="page-header">
        <div><h2>✅ Điểm Danh & Ghi Km</h2><p>Điểm danh học viên và ghi nhận số km thực hành</p></div>
      </div>

      {/* Chọn lớp */}
      <div className="card">
        <div className="card-header"><h3>🏫 Chọn Lớp Học</h3></div>
        <div className="card-body">
          <select className="search-input" style={{maxWidth:320}} value={selectedLop}
            onChange={e => { setSelectedLop(e.target.value); setSelectedLich(null); setDiemDanhData([]) }}>
            <option value="">-- Chọn lớp của bạn --</option>
            {lopList.map(l => <option key={l.id} value={l.id}>{l.ten_lop} — {l.khoa_hoc?.ten_khoa}</option>)}
          </select>
        </div>
      </div>

      {/* Danh sách buổi học */}
      {selectedLop && (
        <div className="card">
          <div className="card-header"><h3>📅 Buổi Học Sắp Tới</h3></div>
          <div className="card-body" style={{padding:0}}>
            {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
              lichList.length === 0 ? (
                <div className="empty-state" style={{padding:'32px'}}><span>📅</span><p>Không có buổi học nào</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Ngày</th><th>Giờ</th><th>Loại</th><th>Địa điểm</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {lichList.map(lh => (
                      <tr key={lh.id} className={selectedLich?.id === lh.id ? 'selected-row' : ''}>
                        <td><strong>{new Date(lh.ngay_hoc).toLocaleDateString('vi-VN')}</strong></td>
                        <td>{lh.gio_bat_dau?.slice(0,5)} – {lh.gio_ket_thuc?.slice(0,5)}</td>
                        <td><span className={`badge ${lh.loai_buoi==='ly_thuyet'?'badge-info':'badge-success'}`}>
                          {lh.loai_buoi==='ly_thuyet'?'📖 Lý thuyết':'🚗 Thực hành'}
                        </span></td>
                        <td>{lh.dia_diem||'—'}</td>
                        <td>
                          <button className="btn btn-success btn-sm" onClick={() => openDiemDanh(lh)}>
                            ✅ Điểm danh
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}

      {/* Form điểm danh */}
      {selectedLich && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>✅ Điểm Danh Buổi Học</h3>
              <p style={{fontSize:12,color:'#718096',marginTop:3}}>
                {new Date(selectedLich.ngay_hoc).toLocaleDateString('vi-VN')} |
                {selectedLich.gio_bat_dau?.slice(0,5)}–{selectedLich.gio_ket_thuc?.slice(0,5)} |
                {selectedLich.loai_buoi==='ly_thuyet'?' 📖 Lý thuyết':' 🚗 Thực hành'}
              </p>
            </div>
            <div className="dd-summary">
              <span className="dd-count-badge">{coMatCount}/{diemDanhData.length} có mặt</span>
            </div>
          </div>
          <div className="card-body">
            {/* Toolbar */}
            <div className="dd-toolbar">
              <button className="btn btn-success btn-sm"
                onClick={() => setDiemDanhData(diemDanhData.map(d => ({...d, co_mat: true})))}>
                ✅ Tất cả có mặt
              </button>
              <button className="btn btn-outline btn-sm"
                onClick={() => setDiemDanhData(diemDanhData.map(d => ({...d, co_mat: false})))}>
                ❌ Bỏ chọn tất cả
              </button>
            </div>

            {diemDanhData.length === 0 ? (
              <div className="empty-state"><span>👥</span><p>Chưa có học viên trong lớp</p></div>
            ) : (
              <div className="dd-list">
                {diemDanhData.map((d, i) => (
                  <div key={i} className={`dd-item ${d.co_mat ? 'present' : 'absent'}`}>
                    <div className="dd-item-left">
                      <div className="dd-avatar-sm">{d.ho_ten?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="dd-name">{d.ho_ten}</p>
                        <p className="dd-cccd">{d.so_cccd}</p>
                      </div>
                    </div>

                    <div className="dd-item-right">
                      {/* Toggle có mặt */}
                      <label className="dd-toggle">
                        <input type="checkbox" checked={d.co_mat}
                          onChange={e => setDiemDanhData(diemDanhData.map((x,j) => j===i ? {...x, co_mat: e.target.checked} : x))} />
                        <span className="dd-toggle-slider" />
                      </label>
                      <span className={`dd-status ${d.co_mat ? 'present' : 'absent'}`}>
                        {d.co_mat ? '✅ Có mặt' : '❌ Vắng'}
                      </span>

                      {/* Km (chỉ hiện khi thực hành + có mặt) */}
                      {selectedLich.loai_buoi === 'thuc_hanh' && d.co_mat && (
                        <div className="dd-km-wrap">
                          <label>🚗 Km:</label>
                          <input type="number" step="0.1" min="0" value={d.km_chay}
                            onChange={e => setDiemDanhData(diemDanhData.map((x,j) => j===i ? {...x, km_chay: e.target.value} : x))}
                            placeholder="0.0" className="km-input" />
                          <span>km</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="dd-footer">
              <button className="btn btn-outline" onClick={() => { setSelectedLich(null); setDiemDanhData([]) }}>
                Hủy
              </button>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="btn-spinner-sm"/>Đang lưu...</> : '💾 Lưu Điểm Danh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GVDiemDanh
