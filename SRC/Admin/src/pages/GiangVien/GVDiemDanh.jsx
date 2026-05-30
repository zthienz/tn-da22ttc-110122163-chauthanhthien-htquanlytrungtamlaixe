import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './GVDiemDanh.css'

const fmt = d => { const s = typeof d === 'string' ? d : new Date(d).toISOString(); return s.slice(0,10) }

const GVDiemDanh = () => {
  const { token, backendUrl, chuyenMon } = useAdmin()
  const headers = { Authorization: `Bearer ${token}` }

  const [lopList, setLopList]     = useState([])
  const [lichHom, setLichHom]     = useState([])   // lịch hôm nay của GV
  const [selectedLich, setSelectedLich] = useState(null)
  const [diemDanhData, setDiemDanhData] = useState([])
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)

  const today = fmt(new Date())
  const isThucHanh = chuyenMon === 'thuc_hanh' || chuyenMon === 'ca_hai'

  useEffect(() => {
    // Lấy lịch hôm nay của GV
    setLoading(true)
    axios.get(`${backendUrl}/api/giang-vien/lich-theo-tuan`, {
      headers, params: { from: today, to: today }
    })
      .then(r => { if (r.data.success) setLichHom(r.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openDiemDanh = async lich => {
    setSelectedLich(lich)
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/lich-hoc/${lich.id}/diem-danh`, { headers })
      if (res.data.success) {
        setDiemDanhData(res.data.data.map(d => ({
          ...d,
          co_mat:   d.co_mat  || false,
          km_chay:  d.km_chay || '',
          ghi_chu:  d.ghi_chu || '',
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
          ghi_chu:  d.ghi_chu || null,
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

  const update = (i, field, val) =>
    setDiemDanhData(diemDanhData.map((x,j) => j===i ? {...x, [field]: val} : x))

  const coMatCount = diemDanhData.filter(d => d.co_mat).length

  return (
    <div className="gv-diemdanh">
      <div className="page-header">
        <div>
          <h2>✅ Điểm Danh</h2>
          <p>{isThucHanh ? 'Điểm danh và ghi nhận km thực hành' : 'Điểm danh học viên lý thuyết'}</p>
        </div>
      </div>

      {/* Lịch hôm nay */}
      <div className="card">
        <div className="card-header">
          <h3>📅 Lịch Dạy Hôm Nay — {new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'numeric',year:'numeric'})}</h3>
        </div>
        <div className="card-body" style={{padding:0}}>
          {loading && !selectedLich ? (
            <div className="loading-wrap"><div className="spinner"/></div>
          ) : lichHom.length === 0 ? (
            <div className="empty-state" style={{padding:'40px'}}>
              <span>🎉</span>
              <p>Hôm nay bạn không có lịch dạy</p>
            </div>
          ) : (
            <div className="dd-lich-list">
              {lichHom.map(lh => (
                <div key={lh.id}
                  className={`dd-lich-item ${selectedLich?.id === lh.id ? 'active' : ''} ${lh.loai_buoi}`}
                  onClick={() => openDiemDanh(lh)}>
                  <div className="dd-lich-time">
                    <span>{lh.gio_bat_dau?.slice(0,5)}</span>
                    <span style={{fontSize:10,color:'#9ca3af'}}>—</span>
                    <span>{lh.gio_ket_thuc?.slice(0,5)}</span>
                  </div>
                  <div className="dd-lich-info">
                    <p className="dd-lich-lop">{lh.lop_hoc?.ten_lop}</p>
                    <p className="dd-lich-type">
                      {lh.loai_buoi==='ly_thuyet'?'📖 Lý thuyết':'🚗 Thực hành'}
                      {lh.dia_diem ? ` · ${lh.dia_diem}` : ''}
                    </p>
                  </div>
                  <button className="btn btn-success btn-sm">✅ Điểm danh</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form điểm danh */}
      {selectedLich && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>✅ Điểm Danh — {selectedLich.lop_hoc?.ten_lop}</h3>
              <p style={{fontSize:12,color:'#718096',marginTop:3}}>
                {selectedLich.gio_bat_dau?.slice(0,5)}–{selectedLich.gio_ket_thuc?.slice(0,5)} |
                {selectedLich.loai_buoi==='ly_thuyet'?' 📖 Lý thuyết':' 🚗 Thực hành'}
              </p>
            </div>
            <span className="dd-count-badge">{coMatCount}/{diemDanhData.length} có mặt</span>
          </div>
          <div className="card-body">
            {/* Toolbar */}
            <div className="dd-toolbar">
              <button className="btn btn-success btn-sm"
                onClick={() => setDiemDanhData(diemDanhData.map(d=>({...d,co_mat:true})))}>
                ✅ Tất cả có mặt
              </button>
              <button className="btn btn-outline btn-sm"
                onClick={() => setDiemDanhData(diemDanhData.map(d=>({...d,co_mat:false})))}>
                ❌ Bỏ chọn tất cả
              </button>
            </div>

            {loading ? <div className="loading-wrap"><div className="spinner"/></div> :
            diemDanhData.length === 0 ? (
              <div className="empty-state"><span>👥</span><p>Chưa có học viên trong lớp</p></div>
            ) : (
              <div className="dd-list">
                {diemDanhData.map((d, i) => (
                  <div key={i} className={`dd-item ${d.co_mat ? 'present' : 'absent'}`}>
                    {/* Trái: avatar + tên */}
                    <div className="dd-item-left">
                      <div className="dd-avatar-sm">{d.ho_ten?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="dd-name">{d.ho_ten}</p>
                        <p className="dd-cccd">{d.so_cccd}</p>
                      </div>
                    </div>

                    {/* Phải: toggle + km + ghi chú */}
                    <div className="dd-item-right">
                      <label className="dd-toggle">
                        <input type="checkbox" checked={d.co_mat}
                          onChange={e => update(i, 'co_mat', e.target.checked)} />
                        <span className="dd-toggle-slider"/>
                      </label>
                      <span className={`dd-status ${d.co_mat?'present':'absent'}`}>
                        {d.co_mat ? '✅ Có mặt' : '❌ Vắng'}
                      </span>

                      {/* Km — chỉ thực hành + có mặt */}
                      {selectedLich.loai_buoi === 'thuc_hanh' && d.co_mat && (
                        <div className="dd-km-wrap">
                          <label>🚗 Km:</label>
                          <input type="number" step="0.1" min="0" value={d.km_chay}
                            onChange={e => update(i, 'km_chay', e.target.value)}
                            placeholder="0.0" className="km-input" />
                          <span>km</span>
                        </div>
                      )}

                      {/* Ghi chú vắng — chỉ khi vắng mặt */}
                      {!d.co_mat && (
                        <input
                          className="dd-ghichu-input"
                          placeholder="Lý do vắng mặt (nếu có)..."
                          value={d.ghi_chu}
                          onChange={e => update(i, 'ghi_chu', e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="dd-footer">
              <button className="btn btn-outline" onClick={() => { setSelectedLich(null); setDiemDanhData([]) }}>Hủy</button>
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : '💾 Lưu Điểm Danh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GVDiemDanh
