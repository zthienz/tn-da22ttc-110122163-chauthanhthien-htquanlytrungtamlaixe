import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './ThiManagement.css'

const ThiManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [lichThi, setLichThi]   = useState([])
  const [lopList, setLopList]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('lich')
  const [showModal, setShowModal]   = useState(false)
  const [showKQModal, setShowKQModal] = useState(false)
  const [viewItem, setViewItem]     = useState(null)
  const [selectedLich, setSelectedLich] = useState(null)
  const [kqData, setKqData]     = useState([])
  const [baiThiList, setBaiThiList] = useState([])
  const DON_VI_MAC_DINH = 'Trung Tâm Lái Xe Ngôi Sao'

  const [form, setForm] = useState({
    khoa_hoc_id: '', loai_thi: 'tot_nghiep', ngay_thi: '', gio_thi: '', dia_diem: '', don_vi_to_chuc: DON_VI_MAC_DINH
  })
  const [khoaList, setKhoaList] = useState([])
  const [search, setSearch]     = useState('')
  const [filterLoai, setFilterLoai] = useState('')
  const headers = { Authorization: `Bearer ${token}` }

  // ── State cho modal thêm học viên vào lịch thi ──────────────────────────
  const [showThemHVModal, setShowThemHVModal] = useState(false)
  const [selectedLichForHV, setSelectedLichForHV] = useState(null)
  const [hocVienDuDK, setHocVienDuDK]         = useState([])   // đủ điều kiện, chưa có trong lịch
  const [hocVienChuaDuDK, setHocVienChuaDuDK] = useState([])   // chưa đủ điều kiện (hiển thị mờ)
  const [daXepVaoLich, setDaXepVaoLich]       = useState([])   // đã có trong lịch
  const [selectedHVIds, setSelectedHVIds]     = useState([])   // checkbox đang chọn
  const [loadingHV, setLoadingHV]             = useState(false)
  const [searchHV, setSearchHV]               = useState('')

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
      khoa_hoc_id:    lt.khoa_hoc_id || '',
      loai_thi:       lt.loai_thi || 'tot_nghiep',
      ngay_thi:       lt.ngay_thi?.split('T')[0] || '',
      gio_thi:        lt.gio_thi?.slice(0, 5) || '',
      dia_diem:       lt.dia_diem || '',
      don_vi_to_chuc: lt.don_vi_to_chuc || '',
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

  // ── Mở modal quản lý học viên trong lịch thi ────────────────────────────
  const openThemHocVien = useCallback(async (lt) => {
    setSelectedLichForHV(lt)
    setSelectedHVIds([])
    setSearchHV('')
    setLoadingHV(true)
    setShowThemHVModal(true)
    try {
      const res = await axios.get(
        `${backendUrl}/api/admin/lich-thi/${lt.id}/hoc-vien-du-dieu-kien`,
        { headers }
      )
      if (res.data.success) {
        setHocVienDuDK(res.data.du_dieu_kien || [])
        setHocVienChuaDuDK(res.data.chua_du_dieu_kien || [])
        setDaXepVaoLich(res.data.da_xep_vao_lich || [])
        setBaiThiList(res.data.bai_thi || [])
      }
    } catch { toast.error('Không thể tải danh sách học viên') }
    setLoadingHV(false)
  }, [backendUrl, token])

  const handleThemHocVien = async () => {
    if (selectedHVIds.length === 0) { toast.warning('Chưa chọn học viên nào'); return }
    try {
      const res = await axios.post(
        `${backendUrl}/api/admin/lich-thi/${selectedLichForHV.id}/them-hoc-vien`,
        { ho_so_ids: selectedHVIds },
        { headers }
      )
      if (res.data.success) {
        toast.success(res.data.message)
        setSelectedHVIds([])
        // Reload danh sách
        const r2 = await axios.get(
          `${backendUrl}/api/admin/lich-thi/${selectedLichForHV.id}/hoc-vien-du-dieu-kien`,
          { headers }
        )
        if (r2.data.success) {
          setHocVienDuDK(r2.data.du_dieu_kien || [])
          setHocVienChuaDuDK(r2.data.chua_du_dieu_kien || [])
          setDaXepVaoLich(r2.data.da_xep_vao_lich || [])
        }
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleXoaKhoiLich = async (hoSoId) => {
    if (!confirm('Xóa học viên này khỏi lịch thi?')) return
    try {
      const res = await axios.delete(
        `${backendUrl}/api/admin/lich-thi/${selectedLichForHV.id}/hoc-vien/${hoSoId}`,
        { headers }
      )
      if (res.data.success) {
        toast.success('Đã xóa học viên khỏi lịch thi')
        const r2 = await axios.get(
          `${backendUrl}/api/admin/lich-thi/${selectedLichForHV.id}/hoc-vien-du-dieu-kien`,
          { headers }
        )
        if (r2.data.success) {
          setHocVienDuDK(r2.data.du_dieu_kien || [])
          setHocVienChuaDuDK(r2.data.chua_du_dieu_kien || [])
          setDaXepVaoLich(r2.data.da_xep_vao_lich || [])
        }
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const openNhapKQ = async lich => {
    setSelectedLich(lich)
    try {
      const res = await axios.get(
        `${backendUrl}/api/admin/lich-thi/${lich.id}/hoc-vien-du-dieu-kien`,
        { headers }
      )
      if (res.data.success) {
        setBaiThiList(res.data.bai_thi || [])
        // Khởi tạo kqData từ danh sách đã xếp, kèm điểm hiện có + bài thi đã đậu
        const hvList = res.data.da_xep_vao_lich || []
        setKqData(hvList.map(hv => ({
          ho_so_id:        hv.ho_so_id,
          ho_ten:          hv.ho_ten,
          so_cccd:         hv.so_cccd,
          diem_theo:       hv.diem_theo || {},       // { bai_thi_id: { diem, ket_qua } }
          bai_thi_da_dat:  hv.bai_thi_da_dat || [],  // [bai_thi_id] đã đậu từ lần trước
        })))
      }
    } catch { toast.error('Không thể tải dữ liệu') }
    setShowKQModal(true)
  }

  const handleSaveKQ = async () => {
    // Chỉ gửi bài thi mà học viên CHƯA đậu từ lần trước
    const payload = []
    kqData.forEach(hv => {
      baiThiList.forEach(b => {
        if (hv.bai_thi_da_dat?.includes(b.id)) return // bỏ qua bài đã đậu
        const entry = hv.diem_theo?.[b.id] || {}
        payload.push({
          ho_so_id:   hv.ho_so_id,
          bai_thi_id: b.id,
          diem:       entry.diem ?? null,
          ket_qua:    entry.ket_qua ?? null,
          nhan_xet:   entry.nhan_xet ?? null,
        })
      })
    })
    try {
      const res = await axios.post(
        `${backendUrl}/api/admin/lich-thi/${selectedLich.id}/ket-qua`,
        { ket_qua: payload },
        { headers }
      )
      if (res.data.success) { toast.success('Nhập kết quả thành công!'); setShowKQModal(false) }
      else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const LOAI_MAP = {
    tot_nghiep: { text: 'Tốt nghiệp', cls: 'badge-blue' },
    sat_hanh:   { text: 'Sát hạch',   cls: 'badge-purple' }
  }

  const filteredThi = lichThi.filter(lt => {
    const matchSearch = !search ||
      lt.khoa_hoc?.ten_khoa?.toLowerCase().includes(search.toLowerCase()) ||
      lt.dia_diem?.toLowerCase().includes(search.toLowerCase()) ||
      lt.don_vi_to_chuc?.toLowerCase().includes(search.toLowerCase())
    const matchLoai = !filterLoai || lt.loai_thi === filterLoai
    return matchSearch && matchLoai
  })

  // Lọc học viên đủ điều kiện theo search
  const filteredHVDuDK = hocVienDuDK.filter(hv =>
    !searchHV ||
    hv.ho_ten?.toLowerCase().includes(searchHV.toLowerCase()) ||
    hv.so_cccd?.includes(searchHV) ||
    hv.ten_lop?.toLowerCase().includes(searchHV.toLowerCase())
  )

  // Lọc học viên CHƯA đủ điều kiện theo search
  const filteredHVChuaDuDK = hocVienChuaDuDK.filter(hv =>
    !searchHV ||
    hv.ho_ten?.toLowerCase().includes(searchHV.toLowerCase()) ||
    hv.so_cccd?.includes(searchHV) ||
    hv.ten_lop?.toLowerCase().includes(searchHV.toLowerCase())
  )

  // Bằng A1 và A không cần km thực hành
  const isKhongCanKm = ['A1', 'A'].includes(selectedLichForHV?.khoa_hoc?.loai_bang)

  const toggleSelectHV = (id) => {
    setSelectedHVIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    // Chỉ chọn/bỏ chọn các học viên ĐỦ điều kiện và không có phí chưa thu
    const eligible = filteredHVDuDK.filter(hv => !hv.co_phi_chua_thu).map(hv => hv.ho_so_id)
    if (selectedHVIds.length === eligible.length && eligible.length > 0) {
      setSelectedHVIds([])
    } else {
      setSelectedHVIds(eligible)
    }
  }

  return (
    <div className="thi-page">
      <div className="page-header">
        <div><h2>🏆 Thi & Kết Quả</h2><p>Quản lý lịch thi tốt nghiệp và sát hạch</p></div>
        <button className="btn btn-primary" onClick={() => {
          setEditingThi(null)
          setForm({ khoa_hoc_id: '', loai_thi: 'tot_nghiep', ngay_thi: '', gio_thi: '', dia_diem: '', don_vi_to_chuc: DON_VI_MAC_DINH })
          setShowModal(true)
        }}>+ Tạo lịch thi</button>
      </div>

      {/* Tabs */}
      <div className="thi-tabs">
        <button className={`thi-tab ${tab === 'lich' ? 'active' : ''}`} onClick={() => setTab('lich')}>📅 Lịch Thi</button>
        <button className={`thi-tab ${tab === 'ket_qua' ? 'active' : ''}`} onClick={() => setTab('ket_qua')}>📊 Kết Quả</button>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input className="search-input" placeholder="🔍 Tìm theo khóa học, địa điểm, đơn vị tổ chức..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" style={{ maxWidth: 200 }} value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="">Tất cả loại thi</option>
          <option value="tot_nghiep">🎓 Tốt nghiệp</option>
          <option value="sat_hanh">🏛️ Sát hạch (BCA)</option>
        </select>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
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
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                    {search || filterLoai ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lịch thi nào'}
                  </td></tr>
                ) : filteredThi.map((lt, i) => {
                  const lm = LOAI_MAP[lt.loai_thi] || { text: lt.loai_thi, cls: 'badge-gray' }
                  return (
                    <tr key={lt.id}>
                      <td>{i + 1}</td>
                      <td><strong>{new Date(lt.ngay_thi).toLocaleDateString('vi-VN')}</strong></td>
                      <td>{lt.gio_thi?.slice(0, 5)}</td>
                      <td><span className={`badge ${lm.cls}`}>{lm.text}</span></td>
                      <td>{lt.khoa_hoc?.ten_khoa || '—'}</td>
                      <td>{lt.dia_diem || '—'}</td>
                      {tab === 'lich' && <td>{lt.don_vi_to_chuc || '—'}</td>}
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-info btn-sm" onClick={() => setViewItem(lt)}>👁️ Xem</button>
                          <button className="btn btn-success btn-sm" onClick={() => openThemHocVien(lt)}>👥 Học viên</button>
                          <button className="btn btn-primary btn-sm" onClick={() => openNhapKQ(lt)}>📝 Nhập KQ</button>
                          <button className="btn btn-warning btn-sm" onClick={() => openEditThi(lt)}>✏️</button>
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

      {/* ── MODAL TẠO / SỬA LỊCH THI ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingThi ? '✏️ Sửa Lịch Thi' : '📅 Tạo Lịch Thi'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTaoLichThi}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Khóa học *</label>
                  <select value={form.khoa_hoc_id} onChange={e => setForm({ ...form, khoa_hoc_id: e.target.value })} required>
                    <option value="">-- Chọn khóa học --</option>
                    {khoaList.map(k => <option key={k.id} value={k.id}>{k.ten_khoa} (Hạng {k.loai_bang})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Loại thi *</label>
                    <select value={form.loai_thi} onChange={e => {
                      const loai = e.target.value
                      setForm(prev => ({
                        ...prev,
                        loai_thi: loai,
                        // Tự động điền mặc định khi chuyển sang tốt nghiệp, xóa khi chuyển sang sát hạch
                        don_vi_to_chuc: loai === 'tot_nghiep'
                          ? (prev.don_vi_to_chuc === '' ? DON_VI_MAC_DINH : prev.don_vi_to_chuc)
                          : (prev.don_vi_to_chuc === DON_VI_MAC_DINH ? '' : prev.don_vi_to_chuc)
                      }))
                    }}>
                      <option value="tot_nghiep">Tốt nghiệp</option>
                      <option value="sat_hanh">Sát hạch (BCA)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ngày thi *</label>
                    <input type="date" value={form.ngay_thi} onChange={e => setForm({ ...form, ngay_thi: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Giờ thi *</label>
                    <input type="time" value={form.gio_thi} onChange={e => setForm({ ...form, gio_thi: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Địa điểm</label>
                    <input value={form.dia_diem} onChange={e => setForm({ ...form, dia_diem: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    {form.loai_thi === 'sat_hanh' ? '🏛️ Đơn vị tổ chức (BCA)' : '🏢 Đơn vị tổ chức'}
                  </label>
                  <input
                    value={form.don_vi_to_chuc}
                    onChange={e => setForm({ ...form, don_vi_to_chuc: e.target.value })}
                    placeholder={form.loai_thi === 'sat_hanh' ? 'VD: Phòng CSGT TP.HCM' : 'VD: Trung tâm lái xe Sao Việt'}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingThi ? 'Cập nhật' : 'Tạo lịch thi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL QUẢN LÝ HỌC VIÊN TRONG LỊCH THI ── */}
      {showThemHVModal && selectedLichForHV && (
        <div className="modal-overlay" onClick={() => setShowThemHVModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>👥 Quản Lý Học Viên Dự Thi</h3>
                <p style={{ fontSize: 12, color: '#718096', marginTop: 3 }}>
                  {selectedLichForHV.khoa_hoc?.ten_khoa || '—'} &nbsp;|&nbsp;
                  {new Date(selectedLichForHV.ngay_thi).toLocaleDateString('vi-VN')} &nbsp;|&nbsp;
                  {LOAI_MAP[selectedLichForHV.loai_thi]?.text || selectedLichForHV.loai_thi}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowThemHVModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {loadingHV ? (
                <div className="loading-wrap"><div className="spinner" /></div>
              ) : (
                <>
                  {/* ── Học viên đã xếp vào lịch thi ── */}
                  <div className="them-hv-section">
                    <div className="them-hv-section-title">
                      ✅ Đã xếp vào lịch thi
                      <span className="them-hv-count">{daXepVaoLich.length} học viên</span>
                    </div>
                    {daXepVaoLich.length === 0 ? (
                      <div className="them-hv-empty">Chưa có học viên nào được xếp vào lịch thi này</div>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th><th>Họ tên</th><th>CCCD</th><th>Trạng thái</th><th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {daXepVaoLich.map((hv, i) => (
                            <tr key={hv.ho_so_id}>
                              <td>{i + 1}</td>
                              <td><strong>{hv.ho_ten}</strong></td>
                              <td style={{ fontFamily: 'monospace' }}>{hv.so_cccd}</td>
                              <td>
                                {hv.ket_qua
                                  ? <span className={`badge ${hv.ket_qua === 'dat' ? 'badge-success' : 'badge-danger'}`}>
                                      {hv.ket_qua === 'dat' ? '✅ Đạt' : '❌ Không đạt'}
                                    </span>
                                  : <span className="badge badge-warning">⏳ Chờ thi</span>
                                }
                              </td>
                              <td>
                                {!hv.ket_qua && (
                                  <button className="btn btn-danger btn-sm" onClick={() => handleXoaKhoiLich(hv.ho_so_id)}>
                                    🗑️ Xóa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* ── Danh sách học viên cùng hạng bằng ── */}
                  <div className="them-hv-section" style={{ marginTop: 20 }}>
                    <div className="them-hv-section-title">
                      🎓 Học viên hạng {selectedLichForHV?.khoa_hoc?.loai_bang || '—'} (chưa xếp lịch)
                      <span className="them-hv-count">
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{hocVienDuDK.length} đủ ĐK</span>
                        {hocVienChuaDuDK.length > 0 && (
                          <span style={{ color: '#9ca3af', marginLeft: 8 }}>· {hocVienChuaDuDK.length} chưa đủ ĐK</span>
                        )}
                      </span>
                    </div>

                    {hocVienDuDK.length === 0 && hocVienChuaDuDK.length === 0 ? (
                      <div className="them-hv-empty">
                        Không có học viên nào cùng hạng bằng chưa được xếp lịch thi.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                          <input
                            className="search-input"
                            style={{ flex: 1 }}
                            placeholder="🔍 Tìm theo tên, CCCD, lớp..."
                            value={searchHV}
                            onChange={e => setSearchHV(e.target.value)}
                          />
                          {selectedHVIds.length > 0 && (
                            <button className="btn btn-primary btn-sm" onClick={handleThemHocVien}>
                              ➕ Thêm {selectedHVIds.length} học viên vào lịch thi
                            </button>
                          )}
                        </div>

                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>
                                <input
                                  type="checkbox"
                                  checked={filteredHVDuDK.length > 0 && selectedHVIds.length === filteredHVDuDK.filter(hv => !hv.co_phi_chua_thu).length && filteredHVDuDK.filter(hv => !hv.co_phi_chua_thu).length > 0}
                                  onChange={toggleSelectAll}
                                  title="Chọn tất cả học viên đủ điều kiện"
                                />
                              </th>
                              <th>#</th><th>Họ tên</th><th>CCCD</th><th>Lớp</th>
                              <th>Buổi LT</th>
                              {!isKhongCanKm && <th>Km TH</th>}
                              <th>Điều kiện</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* ── Học viên ĐỦ điều kiện — hiển thị bình thường ── */}
                            {filteredHVDuDK.map((hv, i) => (
                              <tr key={hv.ho_so_id} className={selectedHVIds.includes(hv.ho_so_id) ? 'row-selected' : ''}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedHVIds.includes(hv.ho_so_id)}
                                    onChange={() => toggleSelectHV(hv.ho_so_id)}
                                    disabled={hv.co_phi_chua_thu}
                                    title={hv.co_phi_chua_thu ? 'Học viên còn phí thi lại chưa đóng' : ''}
                                  />
                                </td>
                                <td>{i + 1}</td>
                                <td>
                                  <strong>{hv.ho_ten}</strong>
                                  {hv.co_phi_chua_thu && (
                                    <div style={{ fontSize: 10, color: '#dc2626', marginTop: 2, fontWeight: 600 }}>
                                      🔒 Còn phí thi lại chưa đóng
                                    </div>
                                  )}
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{hv.so_cccd}</td>
                                <td><span className="badge badge-blue">{hv.ten_lop}</span></td>
                                <td>{hv.so_buoi_ly_thuyet_da_hoc} buổi</td>
                                {!isKhongCanKm && <td>{hv.so_km_da_chay} km</td>}
                                <td>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <span className={`badge ${hv.du_buoi_ly_thuyet ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                                      {hv.du_buoi_ly_thuyet ? '✅ LT' : '❌ LT'}
                                    </span>
                                    {!isKhongCanKm && (
                                      <span className={`badge ${hv.du_km_thuc_hanh ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                                        {hv.du_km_thuc_hanh ? '✅ TH' : '❌ TH'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {/* ── Dòng phân cách nếu có cả 2 nhóm ── */}
                            {filteredHVDuDK.length > 0 && filteredHVChuaDuDK.length > 0 && (
                              <tr>
                                <td colSpan={isKhongCanKm ? 8 : 9} style={{
                                  padding: '6px 12px',
                                  background: '#f8fafc',
                                  borderTop: '2px dashed #e2e8f0',
                                  borderBottom: '2px dashed #e2e8f0',
                                  color: '#94a3b8',
                                  fontSize: 11,
                                  fontStyle: 'italic',
                                  textAlign: 'center',
                                }}>
                                  ── Học viên chưa đủ điều kiện (không thể thêm vào lịch thi) ──
                                </td>
                              </tr>
                            )}

                            {/* ── Học viên CHƯA ĐỦ điều kiện — hiển thị mờ, disable ── */}
                            {filteredHVChuaDuDK.map((hv, i) => (
                              <tr key={hv.ho_so_id} style={{ opacity: 0.4, pointerEvents: 'none' }}>
                                <td>
                                  <input type="checkbox" disabled />
                                </td>
                                <td>{filteredHVDuDK.length + i + 1}</td>
                                <td>
                                  <strong>{hv.ho_ten}</strong>
                                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                                    Chưa đủ điều kiện thi
                                  </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{hv.so_cccd}</td>
                                <td><span className="badge badge-gray">{hv.ten_lop}</span></td>
                                <td>{hv.so_buoi_ly_thuyet_da_hoc} buổi</td>
                                {!isKhongCanKm && <td>{hv.so_km_da_chay} km</td>}
                                <td>
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <span className={`badge ${hv.du_buoi_ly_thuyet ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                                      {hv.du_buoi_ly_thuyet ? '✅ LT' : '❌ LT'}
                                    </span>
                                    {!isKhongCanKm && (
                                      <span className={`badge ${hv.du_km_thuc_hanh ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10 }}>
                                        {hv.du_km_thuc_hanh ? '✅ TH' : '❌ TH'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowThemHVModal(false)}>Đóng</button>
              {selectedHVIds.length > 0 && (
                <button className="btn btn-primary" onClick={handleThemHocVien}>
                  ➕ Thêm {selectedHVIds.length} học viên đã chọn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NHẬP KẾT QUẢ THI ── */}
      {showKQModal && selectedLich && (
        <div className="modal-overlay" onClick={() => setShowKQModal(false)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>📝 Nhập Kết Quả Thi</h3>
                <p style={{ fontSize: 12, color: '#718096', marginTop: 3 }}>
                  {selectedLich.khoa_hoc?.ten_khoa || '—'} &nbsp;|&nbsp;
                  {new Date(selectedLich.ngay_thi).toLocaleDateString('vi-VN')} &nbsp;|&nbsp;
                  {selectedLich.loai_thi === 'tot_nghiep' ? 'Tốt nghiệp' : 'Sát hạch'}
                  {baiThiList.length > 0 && (
                    <span style={{ marginLeft: 8, color: '#7c3aed', fontWeight: 600 }}>
                      ({baiThiList.length} bài thi)
                    </span>
                  )}
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowKQModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {kqData.length === 0 ? (
                <div className="empty-state">
                  <span>📋</span>
                  <h3>Chưa có học viên trong lịch thi</h3>
                  <p>Vui lòng thêm học viên vào lịch thi trước khi nhập kết quả</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => {
                    setShowKQModal(false)
                    openThemHocVien(selectedLich)
                  }}>👥 Thêm học viên</button>
                </div>
              ) : baiThiList.length === 0 ? (
                <div className="empty-state">
                  <span>⚠️</span>
                  <h3>Chưa cấu hình bài thi</h3>
                  <p>Khóa học này chưa có bài thi nào được cấu hình cho loại thi này</p>
                </div>
              ) : (
                <>
                  {/* Chú thích điểm đạt */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    {baiThiList.map(b => (
                      <div key={b.id} style={{
                        background: '#f0f9ff', border: '1px solid #bae6fd',
                        borderRadius: 8, padding: '6px 12px', fontSize: 12
                      }}>
                        <strong style={{ color: '#0369a1' }}>{b.ten_bai_thi}</strong>
                        <span style={{ color: '#64748b', marginLeft: 6 }}>
                          Đạt ≥ {b.diem_dat} điểm
                        </span>
                      </div>
                    ))}
                  </div>

                  <table className="data-table kq-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 40 }}>#</th>
                        <th style={{ minWidth: 160 }}>Học viên</th>
                        <th style={{ minWidth: 120 }}>CCCD</th>
                        {baiThiList.map(b => (
                          <th key={b.id} style={{ minWidth: 140, textAlign: 'center' }}>
                            {b.ten_bai_thi}
                            <div style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>
                              Đạt ≥ {b.diem_dat}đ
                            </div>
                          </th>
                        ))}
                        <th style={{ minWidth: 100, textAlign: 'center' }}>Tổng KQ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kqData.map((hv, i) => {
                        // Bài thi đã đậu từ lần trước (miễn thi lại)
                        const daDat = hv.bai_thi_da_dat || []

                        // Tính tổng kết quả: bài đã đậu trước tính là 'dat', bài lần này nhập thêm
                        const allEntries = baiThiList.map(b => {
                          if (daDat.includes(b.id)) return { ket_qua: 'dat' }
                          return hv.diem_theo?.[b.id]
                        })
                        const hasAnyResult = allEntries.some(e => e?.ket_qua)
                        const allDat  = hasAnyResult && allEntries.every(e => e?.ket_qua === 'dat')
                        const hasVang = allEntries.some(e => e?.ket_qua === 'vang_mat')

                        return (
                          <tr key={hv.ho_so_id}>
                            <td>{i + 1}</td>
                            <td>
                              <strong>{hv.ho_ten}</strong>
                              {daDat.length > 0 && (
                                <div style={{ fontSize: 10, color: '#16a34a', marginTop: 2 }}>
                                  Thi lại ({baiThiList.length - daDat.length}/{baiThiList.length} bài)
                                </div>
                              )}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{hv.so_cccd}</td>
                            {baiThiList.map(b => {
                              // Bài đã đậu từ lần trước → badge, không cho nhập
                              if (daDat.includes(b.id)) {
                                return (
                                  <td key={b.id} style={{ padding: '6px 8px', textAlign: 'center', background: '#f0fdf4' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                      <span className="badge badge-success" style={{ fontSize: 11 }}>✅ Đã đạt</span>
                                      <span style={{ fontSize: 10, color: '#86efac' }}>Miễn thi lại</span>
                                    </div>
                                  </td>
                                )
                              }

                              // Bài chưa đậu → ô nhập điểm
                              const entry = hv.diem_theo?.[b.id] || {}
                              const diem  = entry.diem ?? ''
                              const kq    = entry.ket_qua

                              return (
                                <td key={b.id} style={{ padding: '6px 8px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                    <input
                                      type="number"
                                      step="0.1" min="0" max="100"
                                      placeholder="Điểm"
                                      value={diem}
                                      style={{
                                        width: 72, padding: '4px 8px', textAlign: 'center',
                                        border: `1px solid ${kq === 'dat' ? '#86efac' : kq === 'khong_dat' ? '#fca5a5' : '#e2e8f0'}`,
                                        borderRadius: 6, fontSize: 13,
                                        background: kq === 'dat' ? '#f0fdf4' : kq === 'khong_dat' ? '#fff1f2' : '#fff',
                                      }}
                                      onChange={e => {
                                        const val  = e.target.value
                                        const d    = val === '' ? null : parseFloat(val)
                                        const auto = d === null ? null : (d >= b.diem_dat ? 'dat' : 'khong_dat')
                                        setKqData(prev => prev.map((x, j) => j !== i ? x : {
                                          ...x,
                                          diem_theo: {
                                            ...x.diem_theo,
                                            [b.id]: { ...x.diem_theo?.[b.id], diem: d, ket_qua: auto }
                                          }
                                        }))
                                      }}
                                    />
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      {['dat', 'khong_dat', 'vang_mat'].map(v => (
                                        <button
                                          key={v}
                                          type="button"
                                          title={v === 'dat' ? 'Đạt' : v === 'khong_dat' ? 'Không đạt' : 'Vắng'}
                                          style={{
                                            padding: '2px 6px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: kq === v ? (v === 'dat' ? '#16a34a' : v === 'khong_dat' ? '#dc2626' : '#d97706') : '#e2e8f0',
                                            background: kq === v ? (v === 'dat' ? '#dcfce7' : v === 'khong_dat' ? '#fee2e2' : '#fef3c7') : '#f8fafc',
                                            color: kq === v ? (v === 'dat' ? '#16a34a' : v === 'khong_dat' ? '#dc2626' : '#d97706') : '#94a3b8',
                                            fontWeight: kq === v ? 700 : 400,
                                          }}
                                          onClick={() => setKqData(prev => prev.map((x, j) => j !== i ? x : {
                                            ...x,
                                            diem_theo: {
                                              ...x.diem_theo,
                                              [b.id]: { ...x.diem_theo?.[b.id], ket_qua: v }
                                            }
                                          }))}
                                        >
                                          {v === 'dat' ? '✅' : v === 'khong_dat' ? '❌' : '⚠️'}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              )
                            })}
                            <td style={{ textAlign: 'center' }}>
                              {!hasAnyResult ? (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                              ) : hasVang ? (
                                <span className="badge badge-warning">⚠️ Vắng</span>
                              ) : allDat ? (
                                <span className="badge badge-success">✅ Đạt</span>
                              ) : (
                                <span className="badge badge-danger">❌ Không đạt</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowKQModal(false)}>Hủy</button>
              {kqData.length > 0 && baiThiList.length > 0 && (
                <button className="btn btn-primary" onClick={handleSaveKQ}>💾 Lưu kết quả</button>
              )}
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
              <div style={{ textAlign: 'center', marginBottom: 20, padding: '14px', background: '#fdf4ff', borderRadius: 10 }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🏆</div>
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  {viewItem.loai_thi === 'tot_nghiep' ? 'Thi Tốt Nghiệp' : 'Thi Sát Hạch (BCA)'}
                </h2>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {(() => {
                    const lm = LOAI_MAP[viewItem.loai_thi] || { text: viewItem.loai_thi, cls: 'badge-gray' }
                    return <span className={`badge ${lm.cls}`}>{lm.text}</span>
                  })()}
                  {viewItem.khoa_hoc && <span className="badge badge-blue">Hạng {viewItem.khoa_hoc.loai_bang}</span>}
                </div>
              </div>

              <div style={thiSectionTitle}>📋 Thông Tin Kỳ Thi</div>
              <div style={thiGrid}>
                <div style={thiBox}>
                  <div style={thiLabel}>📅 Ngày thi</div>
                  <div style={thiVal}>{new Date(viewItem.ngay_thi).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={thiBox}>
                  <div style={thiLabel}>⏰ Giờ thi</div>
                  <div style={thiVal}>{viewItem.gio_thi?.slice(0, 5) || '—'}</div>
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

              <div style={{ ...thiSectionTitle, marginTop: 16 }}>
                {viewItem.loai_thi === 'sat_hanh' ? '🏛️ Đơn Vị Tổ Chức (BCA)' : '🏢 Đơn Vị Tổ Chức'}
              </div>
              <div style={thiBox}>
                <div style={thiVal}>{viewItem.don_vi_to_chuc || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa cập nhật</span>}</div>
              </div>

              <div style={{ ...thiGrid, marginTop: 12 }}>
                <div style={{ ...thiBox, background: '#f9fafb' }}>
                  <div style={thiLabel}>🗓️ Ngày tạo</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{viewItem.created_at ? new Date(viewItem.created_at).toLocaleDateString('vi-VN') : '—'}</div>
                </div>
                <div style={{ ...thiBox, background: '#f9fafb' }}>
                  <div style={thiLabel}>🔄 Cập nhật</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{viewItem.updated_at ? new Date(viewItem.updated_at).toLocaleDateString('vi-VN') : '—'}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewItem(null)}>Đóng</button>
              <button className="btn btn-success" onClick={() => { setViewItem(null); openThemHocVien(viewItem) }}>👥 Quản lý học viên</button>
              <button className="btn btn-primary" onClick={() => { setViewItem(null); openNhapKQ(viewItem) }}>📝 Nhập kết quả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const thiSectionTitle = { fontSize: 13, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 8, borderBottom: '2px solid #ede9fe', marginBottom: 12 }
const thiGrid  = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }
const thiBox   = { background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '10px 14px' }
const thiLabel = { fontSize: 11, fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
const thiVal   = { fontSize: 14, fontWeight: 600, color: '#111827' }

export default ThiManagement
