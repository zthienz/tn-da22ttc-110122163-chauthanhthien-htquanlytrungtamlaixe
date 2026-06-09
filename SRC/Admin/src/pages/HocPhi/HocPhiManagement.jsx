import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './HocPhiManagement.css'

const PHUONG_THUC_MAP = {
  tien_mat:     { text: '💵 Tiền mặt',     cls: 'badge-gray' },
  chuyen_khoan: { text: '🏦 Chuyển khoản', cls: 'badge-blue' },
  vnpay:        { text: '💳 VNPay',         cls: 'badge-info' },
  momo:         { text: '📱 MoMo',          cls: 'badge-purple' },
}

const fmtMoney = v => Number(v || 0).toLocaleString('vi-VN') + ' ₫'
const fmtDate  = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const LOAI_THI_MAP = { tot_nghiep: 'Tốt nghiệp', sat_hanh: 'Sát hạch' }

const HocPhiManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [tab, setTab]           = useState('hoc_phi')

  // ── Tab Học phí ──
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterPM, setFilterPM] = useState('')
  const [viewItem, setViewItem] = useState(null)

  // ── Tab Phí thi lại ──
  const [phiList, setPhiList]       = useState([])
  const [phiLoading, setPhiLoading] = useState(false)
  const [phiSearch, setPhiSearch]   = useState('')

  // ── Modal thu phí thi lại ──
  const [showThuPhiModal, setShowThuPhiModal] = useState(false)
  const [selectedHoSo, setSelectedHoSo]       = useState(null)
  const [phiChuaThu, setPhiChuaThu]           = useState([])
  const [phiChuaThuLoading, setPhiChuaThuLoading] = useState(false)
  const [selectedBaiThiIds, setSelectedBaiThiIds] = useState([])
  const [phuongThuc, setPhuongThuc]           = useState('tien_mat')
  const [maGiaoDich, setMaGiaoDich]           = useState('')

  const headers = { Authorization: `Bearer ${token}` }

  const fetchHocPhi = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/hoc-phi`, { headers })
      if (res.data.success) setList(res.data.data)
    } catch { toast.error('Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }

  const fetchPhiThiLai = async () => {
    setPhiLoading(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/phi-thi-lai`, {
        headers,
        params: { search: phiSearch || undefined }
      })
      if (res.data.success) setPhiList(res.data.data)
    } catch { toast.error('Lỗi tải dữ liệu phí thi lại') }
    finally { setPhiLoading(false) }
  }

  useEffect(() => { fetchHocPhi() }, [])
  useEffect(() => { if (tab === 'phi_thi_lai') fetchPhiThiLai() }, [tab, phiSearch])

  // Mở modal thu phí thi lại cho 1 học viên
  const openThuPhi = async (hoSoId, hoTen, soCccd) => {
    setSelectedHoSo({ id: hoSoId, ho_ten: hoTen, so_cccd: soCccd })
    setSelectedBaiThiIds([])
    setPhuongThuc('tien_mat')
    setMaGiaoDich('')
    setPhiChuaThuLoading(true)
    setShowThuPhiModal(true)
    try {
      const res = await axios.get(
        `${backendUrl}/api/admin/ho-so/${hoSoId}/phi-thi-lai-chua-thu`,
        { headers }
      )
      if (res.data.success) setPhiChuaThu(res.data.data)
    } catch { toast.error('Lỗi tải dữ liệu') }
    finally { setPhiChuaThuLoading(false) }
  }

  const handleThuPhi = async () => {
    if (selectedBaiThiIds.length === 0) { toast.warning('Chưa chọn bài thi nào'); return }
    // Nhóm theo lich_thi_id — chỉ thu 1 lần 1 lịch thi
    const lichThiId = phiChuaThu.find(b => selectedBaiThiIds.includes(b.bai_thi_id))?.lich_thi_id
    if (!lichThiId) { toast.error('Không xác định được lịch thi'); return }

    try {
      const res = await axios.post(
        `${backendUrl}/api/admin/ho-so/${selectedHoSo.id}/phi-thi-lai`,
        {
          bai_thi_ids:  selectedBaiThiIds,
          lich_thi_id:  lichThiId,
          phuong_thuc:  phuongThuc,
          ma_giao_dich: maGiaoDich || undefined,
        },
        { headers }
      )
      if (res.data.success) {
        toast.success(`${res.data.message} — ${fmtMoney(res.data.tong_phi)}`)
        setShowThuPhiModal(false)
        fetchPhiThiLai()
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  // ── Filter học phí ──
  const filteredHP = list.filter(item => {
    const matchSearch = !search ||
      item.ho_so?.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
      item.ho_so?.so_cccd?.includes(search) ||
      (item.ma_giao_dich || '').includes(search)
    const matchPM = !filterPM || item.phuong_thuc === filterPM
    return matchSearch && matchPM
  })

  const tongThu = filteredHP.reduce((s, i) => s + Number(i.so_tien || 0), 0)
  const tienMat = filteredHP.filter(i => i.phuong_thuc === 'tien_mat').reduce((s, i) => s + Number(i.so_tien || 0), 0)
  const online  = filteredHP.filter(i => i.phuong_thuc !== 'tien_mat').reduce((s, i) => s + Number(i.so_tien || 0), 0)

  // Tính tổng phí thi lại đang hiển thị
  const tongPhiThiLai = phiList.reduce((s, i) => s + Number(i.so_tien || 0), 0)

  // Tính tổng phí cần thu khi chọn bài
  const tongChon = phiChuaThu
    .filter(b => selectedBaiThiIds.includes(b.bai_thi_id))
    .reduce((s, b) => s + Number(b.phi_thi_lai || 0), 0)

  // Nhóm phiChuaThu theo lich_thi_id
  const phiTheaLich = phiChuaThu.reduce((acc, b) => {
    const key = b.lich_thi_id
    if (!acc[key]) acc[key] = { lich_thi_id: key, ngay_thi: b.ngay_thi, loai_thi: b.loai_thi, bai_thi: [] }
    acc[key].bai_thi.push(b)
    return acc
  }, {})

  return (
    <div className="hocphi-page">
      <div className="page-header">
        <div>
          <h2>💰 Quản Lý Học Phí</h2>
          <p>Theo dõi lịch sử thu học phí và phí thi lại</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {tab === 'phi_thi_lai' && (
            <button className="btn btn-primary" onClick={() => {
              // Mở modal tìm học viên để thu phí
              const cccd = prompt('Nhập CCCD học viên cần thu phí thi lại:')
              if (!cccd) return
              const hv = list.find(t => t.ho_so?.so_cccd === cccd)
              if (hv) openThuPhi(hv.ho_so_id, hv.ho_so?.ho_ten, cccd)
              else toast.warning('Không tìm thấy học viên — hãy thu phí từ trang Hồ Sơ Học Viên')
            }}>💳 Thu phí thi lại</button>
          )}
          <button className="btn btn-outline" onClick={() => tab === 'hoc_phi' ? fetchHocPhi() : fetchPhiThiLai()}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="hocphi-tabs">
        <button className={`hocphi-tab ${tab==='hoc_phi'?'active':''}`} onClick={() => setTab('hoc_phi')}>
          📚 Học Phí
        </button>
        <button className={`hocphi-tab ${tab==='phi_thi_lai'?'active':''}`} onClick={() => setTab('phi_thi_lai')}>
          🔁 Phí Thi Lại
        </button>
      </div>

      {/* ── Tab học phí ── */}
      {tab === 'hoc_phi' && (
        <>
          <div className="hocphi-stats">
            {[
              { icon:'📋', label:'Giao dịch',             value: filteredHP.length,      cls:'' },
              { icon:'💰', label:'Tổng thu',               value: fmtMoney(tongThu),      cls:'green' },
              { icon:'💵', label:'Tiền mặt',               value: fmtMoney(tienMat),      cls:'orange' },
              { icon:'🏦', label:'Chuyển khoản / Online',  value: fmtMoney(online),       cls:'blue' },
            ].map((s, i) => (
              <div key={i} className={`hocphi-stat-card ${s.cls}`}>
                <div className="hocphi-stat-icon">{s.icon}</div>
                <div>
                  <div className="hocphi-stat-value">{s.value}</div>
                  <div className="hocphi-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="search-bar">
            <input className="search-input" placeholder="🔍 Tìm theo tên, CCCD, mã giao dịch..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="search-input" style={{ maxWidth:200 }} value={filterPM} onChange={e => setFilterPM(e.target.value)}>
              <option value="">Tất cả phương thức</option>
              {Object.entries(PHUONG_THUC_MAP).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding:0 }}>
              {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Học viên</th><th>CCCD</th><th>Khóa học</th><th>Số tiền</th><th>Phương thức</th><th>Người thu</th><th>Ngày thu</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredHP.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign:'center', padding:'40px', color:'#a0aec0' }}>Chưa có dữ liệu học phí</td></tr>
                    ) : filteredHP.map((item, i) => {
                      const pm = PHUONG_THUC_MAP[item.phuong_thuc] || { text: item.phuong_thuc, cls:'badge-gray' }
                      return (
                        <tr key={item.id}>
                          <td>{i + 1}</td>
                          <td><strong>{item.ho_so?.ho_ten || '—'}</strong></td>
                          <td><code style={{ fontSize:12 }}>{item.ho_so?.so_cccd || '—'}</code></td>
                          <td style={{ fontSize:12 }}>{item.ho_so?.khoa_hoc?.ten_khoa || '—'}</td>
                          <td><strong style={{ color:'#16a34a' }}>{fmtMoney(item.so_tien)}</strong></td>
                          <td><span className={`badge ${pm.cls}`}>{pm.text}</span></td>
                          <td style={{ fontSize:12 }}>{item.nguoi_thu || '—'}</td>
                          <td style={{ fontSize:12 }}>{fmtDate(item.ngay_thanh_toan)}</td>
                          <td><button className="btn btn-info btn-sm" onClick={() => setViewItem(item)}>👁️</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ padding:'10px 16px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, fontSize:13, color:'#92400e' }}>
            ℹ️ Để thu học phí học viên, vào <strong>Hồ Sơ Học Viên</strong> → chọn học viên → nhấn <strong>💰 Thu HP</strong>
          </div>
        </>
      )}

      {/* ── Tab phí thi lại ── */}
      {tab === 'phi_thi_lai' && (
        <>
          <div className="hocphi-stats">
            <div className="hocphi-stat-card">
              <div className="hocphi-stat-icon">📋</div>
              <div>
                <div className="hocphi-stat-value">{phiList.length}</div>
                <div className="hocphi-stat-label">Giao dịch thi lại</div>
              </div>
            </div>
            <div className="hocphi-stat-card green">
              <div className="hocphi-stat-icon">💰</div>
              <div>
                <div className="hocphi-stat-value">{fmtMoney(tongPhiThiLai)}</div>
                <div className="hocphi-stat-label">Tổng thu phí thi lại</div>
              </div>
            </div>
          </div>

          <div className="search-bar">
            <input className="search-input" placeholder="🔍 Tìm theo tên, CCCD..."
              value={phiSearch} onChange={e => setPhiSearch(e.target.value)} />
          </div>

          <div className="card">
            <div className="card-body" style={{ padding:0 }}>
              {phiLoading ? <div className="loading-wrap"><div className="spinner"/></div> : (
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Học viên</th><th>Bài thi</th><th>Lịch thi</th><th>Loại thi</th><th>Số tiền</th><th>Phương thức</th><th>Người thu</th><th>Ngày thu</th></tr>
                  </thead>
                  <tbody>
                    {phiList.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign:'center', padding:'40px', color:'#a0aec0' }}>Chưa có giao dịch phí thi lại nào</td></tr>
                    ) : phiList.map((item, i) => {
                      const pm = PHUONG_THUC_MAP[item.phuong_thuc] || { text: item.phuong_thuc, cls:'badge-gray' }
                      return (
                        <tr key={item.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{item.ho_so?.ho_ten || '—'}</strong>
                            <div style={{ fontSize:11, color:'#718096' }}>{item.ho_so?.so_cccd}</div>
                          </td>
                          <td><span className="badge badge-warning">{item.bai_thi?.ten_bai_thi || '—'}</span></td>
                          <td style={{ fontSize:12 }}>{item.lich_thi ? fmtDate(item.lich_thi.ngay_thi) : '—'}</td>
                          <td style={{ fontSize:12 }}>{LOAI_THI_MAP[item.lich_thi?.loai_thi] || '—'}</td>
                          <td><strong style={{ color:'#16a34a' }}>{fmtMoney(item.so_tien)}</strong></td>
                          <td><span className={`badge ${pm.cls}`}>{pm.text}</span></td>
                          <td style={{ fontSize:12 }}>{item.nguoi_thu || '—'}</td>
                          <td style={{ fontSize:12 }}>{fmtDate(item.ngay_thanh_toan)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ padding:'10px 16px', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, fontSize:13, color:'#92400e' }}>
            ℹ️ Để thu phí thi lại, vào <strong>Hồ Sơ Học Viên</strong> → chọn học viên → nhấn <strong>🔁 Thu phí thi lại</strong>
          </div>
        </>
      )}

      {/* ── Modal thu phí thi lại ── */}
      {showThuPhiModal && selectedHoSo && (
        <div className="modal-overlay" onClick={() => setShowThuPhiModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🔁 Thu Phí Thi Lại</h3>
                <p style={{ fontSize:12, color:'#718096', marginTop:3 }}>
                  {selectedHoSo.ho_ten} — {selectedHoSo.so_cccd}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowThuPhiModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {phiChuaThuLoading ? (
                <div className="loading-wrap"><div className="spinner"/></div>
              ) : Object.keys(phiTheaLich).length === 0 ? (
                <div className="empty-state">
                  <span>✅</span>
                  <h3>Không có khoản phí thi lại nào chưa thu</h3>
                  <p>Học viên này chưa có bài thi rớt hoặc đã thu phí đầy đủ.</p>
                </div>
              ) : (
                <>
                  {Object.values(phiTheaLich).map(lichObj => (
                    <div key={lichObj.lich_thi_id} style={{ marginBottom:16 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0d47a1', marginBottom:8, padding:'6px 10px', background:'#eff6ff', borderRadius:6 }}>
                        📅 {fmtDate(lichObj.ngay_thi)} — {LOAI_THI_MAP[lichObj.loai_thi] || lichObj.loai_thi}
                      </div>
                      {lichObj.bai_thi.map(b => (
                        <label key={b.bai_thi_id} style={{
                          display:'flex', alignItems:'center', gap:12,
                          padding:'10px 14px', borderRadius:8, marginBottom:6, cursor:'pointer',
                          border:`1px solid ${selectedBaiThiIds.includes(b.bai_thi_id) ? '#0d47a1' : '#e2e8f0'}`,
                          background: selectedBaiThiIds.includes(b.bai_thi_id) ? '#eff6ff' : '#fff',
                        }}>
                          <input type="checkbox"
                            checked={selectedBaiThiIds.includes(b.bai_thi_id)}
                            onChange={() => setSelectedBaiThiIds(prev =>
                              prev.includes(b.bai_thi_id)
                                ? prev.filter(x => x !== b.bai_thi_id)
                                : [...prev, b.bai_thi_id]
                            )}
                          />
                          <div style={{ flex:1 }}>
                            <strong style={{ fontSize:14 }}>{b.ten_bai_thi}</strong>
                            <span className={`badge ${b.ket_qua === 'vang_mat' ? 'badge-warning' : 'badge-danger'}`} style={{ marginLeft:8, fontSize:11 }}>
                              {b.ket_qua === 'vang_mat' ? '⚠️ Vắng' : '❌ Không đạt'}
                            </span>
                            {b.diem !== null && b.diem !== undefined && (
                              <span style={{ fontSize:12, color:'#718096', marginLeft:8 }}>Điểm: {b.diem}</span>
                            )}
                          </div>
                          <strong style={{ color:'#dc2626', fontSize:14 }}>{fmtMoney(b.phi_thi_lai)}</strong>
                        </label>
                      ))}
                    </div>
                  ))}

                  {selectedBaiThiIds.length > 0 && (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'10px 14px', marginTop:12 }}>
                      <strong style={{ color:'#15803d', fontSize:13 }}>
                        Tổng phí: {fmtMoney(tongChon)} ({selectedBaiThiIds.length} bài)
                      </strong>
                    </div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 }}>
                    <div className="form-group">
                      <label>Phương thức thanh toán *</label>
                      <select value={phuongThuc} onChange={e => setPhuongThuc(e.target.value)}>
                        {Object.entries(PHUONG_THUC_MAP).map(([k,v]) => <option key={k} value={k}>{v.text}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mã giao dịch</label>
                      <input value={maGiaoDich} onChange={e => setMaGiaoDich(e.target.value)} placeholder="Tùy chọn" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowThuPhiModal(false)}>Hủy</button>
              {selectedBaiThiIds.length > 0 && (
                <button className="btn btn-primary" onClick={handleThuPhi}>
                  💳 Thu {fmtMoney(tongChon)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết học phí */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Chi Tiết Giao Dịch</h3>
              <button className="modal-close" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="hocphi-detail-card">
                <div className="hocphi-detail-avatar">{viewItem.ho_so?.ho_ten?.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="hocphi-detail-name">{viewItem.ho_so?.ho_ten}</p>
                  <code className="hocphi-detail-cccd">{viewItem.ho_so?.so_cccd}</code>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px', marginTop:16 }}>
                {[
                  ['Khóa học',    viewItem.ho_so?.khoa_hoc?.ten_khoa || '—'],
                  ['Số tiền',     fmtMoney(viewItem.so_tien)],
                  ['Phương thức', PHUONG_THUC_MAP[viewItem.phuong_thuc]?.text || viewItem.phuong_thuc],
                  ['Mã giao dịch',viewItem.ma_giao_dich || '—'],
                  ['Người thu',   viewItem.nguoi_thu || '—'],
                  ['Ngày thu',    fmtDate(viewItem.ngay_thanh_toan)],
                  ['Trạng thái',  viewItem.trang_thai === 'thanh_cong' ? '✅ Thành công' : viewItem.trang_thai],
                  ['Ghi chú',     viewItem.ghi_chu || '—'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', gap:2 }}>
                    <span style={{ color:'#718096', fontSize:12 }}>{k}</span>
                    <strong style={{ fontSize:14 }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HocPhiManagement
