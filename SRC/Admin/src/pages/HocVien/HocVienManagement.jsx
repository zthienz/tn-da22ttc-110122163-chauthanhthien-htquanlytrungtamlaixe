import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './HocVienManagement.css'

const TRANG_THAI_MAP = {
  cho_dong_hoc_phi:      { text:'Chờ đóng HP',    cls:'badge-warning' },
  cho_mo_lop:            { text:'Chờ mở lớp',      cls:'badge-info' },
  dang_hoc:              { text:'Đang học',         cls:'badge-success' },
  du_dieu_kien_thi_tn:   { text:'Đủ ĐK thi TN',    cls:'badge-blue' },
  hoan_thanh_tn:         { text:'Hoàn thành TN',    cls:'badge-success' },
  da_cap_bang:           { text:'Đã cấp bằng',      cls:'badge-success' },
}

const HocVienManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [hocVienList, setHocVienList] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)   // modal chi tiết
  const [detail, setDetail]           = useState(null)   // dữ liệu chi tiết từ API
  const [loadingDetail, setLoadingDetail] = useState(false)
  const headers = { Authorization: `Bearer ${token}` }

  const fetchHocVien = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/ho-so`, { headers })
      if (res.data.success) setHocVienList(res.data.data)
    } catch {
      toast.error('Lỗi tải danh sách học viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHocVien() }, [])

  const openDetail = async (hv) => {
    setSelected(hv)
    setDetail(null)
    setLoadingDetail(true)
    try {
      const res = await axios.get(`${backendUrl}/api/admin/ho-so/${hv.id}`, { headers })
      if (res.data.success) setDetail(res.data.data)
    } catch {
      toast.error('Lỗi tải chi tiết học viên')
    } finally {
      setLoadingDetail(false)
    }
  }

  const filtered = hocVienList.filter(hv =>
    hv.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
    hv.so_cccd?.includes(search) ||
    hv.so_dien_thoai?.includes(search)
  )

  return (
    <div className="management-page">
      <div className="page-header">
        <h2 className="page-title">👨‍🎓 Quản Lý Học Viên</h2>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên, CCCD, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {loading ? (
            <div className="loading-wrap"><div className="spinner"/></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Họ Tên</th><th>CCCD</th><th>SĐT</th>
                  <th>Khóa Học</th><th>Học Phí</th><th>Trạng Thái</th><th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="empty-row">Không có dữ liệu</td></tr>
                ) : filtered.map((hv, idx) => {
                  const ts = TRANG_THAI_MAP[hv.trang_thai] || { text: hv.trang_thai, cls:'badge-gray' }
                  return (
                    <tr key={hv.id}>
                      <td>{idx + 1}</td>
                      <td><strong>{hv.ho_ten}</strong></td>
                      <td><code style={{fontSize:12}}>{hv.so_cccd}</code></td>
                      <td>{hv.so_dien_thoai || '—'}</td>
                      <td>{hv.khoa_hoc?.ten_khoa || '—'}</td>
                      <td>
                        <span className={`badge ${hv.trang_thai_hoc_phi === 'da_dong' ? 'badge-success' : 'badge-danger'}`}>
                          {hv.trang_thai_hoc_phi === 'da_dong' ? '✅ Đã đóng' : '❌ Chưa đóng'}
                        </span>
                      </td>
                      <td><span className={`badge ${ts.cls}`}>{ts.text}</span></td>
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-info btn-sm" onClick={() => openDetail(hv)}>
                            👁️ Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal chi tiết học viên */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👨‍🎓 Chi Tiết Học Viên — {selected.ho_ten}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              {loadingDetail ? (
                <div className="loading-wrap"><div className="spinner"/></div>
              ) : detail ? (
                <div>
                  {/* Thông tin cá nhân */}
                  <h4 style={{marginBottom:12,color:'#0d47a1'}}>📋 Thông tin cá nhân</h4>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:20}}>
                    {[
                      ['Họ tên',       detail.ho_ten],
                      ['Số CCCD',      detail.so_cccd],
                      ['Ngày sinh',    detail.ngay_sinh ? new Date(detail.ngay_sinh).toLocaleDateString('vi-VN') : '—'],
                      ['Số điện thoại',detail.so_dien_thoai || '—'],
                      ['Email',        detail.email || '—'],
                      ['Địa chỉ',      detail.dia_chi || '—'],
                      ['Nguồn ĐK',     detail.nguon_dang_ky === 'online' ? '🌐 Online' : '🏢 Offline'],
                      ['Khóa học',     detail.khoa_hoc?.ten_khoa || '—'],
                    ].map(([k,v],i) => (
                      <div key={i} style={{display:'flex',gap:8}}>
                        <span style={{color:'#718096',minWidth:120,fontSize:13}}>{k}:</span>
                        <strong style={{fontSize:13}}>{v}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Học phí */}
                  <h4 style={{marginBottom:12,color:'#0d47a1'}}>💰 Học phí</h4>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:20}}>
                    {[
                      ['Trạng thái', detail.trang_thai_hoc_phi === 'da_dong' ? '✅ Đã đóng' : '❌ Chưa đóng'],
                      ['Đã đóng',    Number(detail.hoc_phi_da_dong||0).toLocaleString('vi-VN') + ' VNĐ'],
                      ['Ngày đóng',  detail.ngay_dong_hoc_phi ? new Date(detail.ngay_dong_hoc_phi).toLocaleDateString('vi-VN') : '—'],
                      ['Học phí KH', Number(detail.khoa_hoc?.hoc_phi||0).toLocaleString('vi-VN') + ' VNĐ'],
                    ].map(([k,v],i) => (
                      <div key={i} style={{display:'flex',gap:8}}>
                        <span style={{color:'#718096',minWidth:120,fontSize:13}}>{k}:</span>
                        <strong style={{fontSize:13}}>{v}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Tiến độ học */}
                  {detail.hoc_vien_lop && (
                    <>
                      <h4 style={{marginBottom:12,color:'#0d47a1'}}>📊 Tiến độ học tập</h4>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px',marginBottom:20}}>
                        {[
                          ['Lớp học',       detail.hoc_vien_lop?.lop_hoc?.ten_lop || '—'],
                          ['Ngày xếp lớp',  detail.hoc_vien_lop?.ngay_xep_lop ? new Date(detail.hoc_vien_lop.ngay_xep_lop).toLocaleDateString('vi-VN') : '—'],
                          ['Buổi LT đã học',detail.hoc_vien_lop?.so_buoi_ly_thuyet_da_hoc + ' buổi'],
                          ['Buổi TH đã học',detail.hoc_vien_lop?.so_buoi_thuc_hanh_da_hoc + ' buổi'],
                          ['Km đã chạy',    Number(detail.hoc_vien_lop?.so_km_da_chay||0).toLocaleString() + ' km'],
                          ['Đủ ĐK thi TN',  detail.hoc_vien_lop?.du_dieu_kien_thi_tn ? '✅ Đủ' : '❌ Chưa đủ'],
                        ].map(([k,v],i) => (
                          <div key={i} style={{display:'flex',gap:8}}>
                            <span style={{color:'#718096',minWidth:120,fontSize:13}}>{k}:</span>
                            <strong style={{fontSize:13}}>{v}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Kết quả thi */}
                  {detail.ket_qua_thi?.length > 0 && (
                    <>
                      <h4 style={{marginBottom:12,color:'#0d47a1'}}>🏆 Kết quả thi</h4>
                      <table className="data-table" style={{marginBottom:16}}>
                        <thead><tr><th>Bài thi</th><th>Điểm</th><th>Kết quả</th><th>Lần thi</th></tr></thead>
                        <tbody>
                          {detail.ket_qua_thi.map(kq => (
                            <tr key={kq.id}>
                              <td>{kq.bai_thi?.ten_bai_thi}</td>
                              <td>{kq.diem ?? '—'}</td>
                              <td><span className={`badge ${kq.ket_qua === 'dat' ? 'badge-success' : 'badge-danger'}`}>{kq.ket_qua === 'dat' ? '✅ Đạt' : '❌ Không đạt'}</span></td>
                              <td>Lần {kq.lan_thi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              ) : <p style={{textAlign:'center',color:'#a0aec0'}}>Không tải được dữ liệu</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HocVienManagement
