import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTeacher } from '../../context/TeacherContext'
import './GVLopHoc.css'

const GVLopHoc = () => {
  const { token, backendUrl } = useTeacher()
  const [lopList, setLopList]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)
  const [hocVienList, setHocVienList] = useState([])
  const [lichHocList, setLichHocList] = useState([])
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/lop-cua-toi`, { headers })
      .then(res => { if (res.data.success) setLopList(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openLop = async lop => {
    setSelected(lop)
    try {
      const [r1, r2] = await Promise.all([
        axios.get(`${backendUrl}/api/giang-vien/lop/${lop.id}/hoc-vien`, { headers }),
        axios.get(`${backendUrl}/api/giang-vien/lop/${lop.id}/lich-hoc`, { headers }),
      ])
      if (r1.data.success) setHocVienList(r1.data.data)
      if (r2.data.success) setLichHocList(r2.data.data)
    } catch {}
  }

  const TS_MAP   = { chuan_bi: 'badge-info', dang_hoc: 'badge-success', da_ket_thuc: 'badge-gray' }
  const TS_LABEL = { chuan_bi: 'Chuẩn bị',  dang_hoc: 'Đang học',      da_ket_thuc: 'Kết thúc' }

  return (
    <div className="gvlh-page">
      <div className="page-header">
        <div><h2>🏫 Lớp Đang Dạy</h2><p>Danh sách lớp học bạn được phân công giảng dạy</p></div>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner" /></div> : (
        lopList.length === 0 ? (
          <div className="empty-state card" style={{ padding: '60px' }}>
            <span>🏫</span>
            <h3>Chưa được phân công lớp nào</h3>
            <p>Vui lòng liên hệ quản trị viên để được phân công lớp dạy</p>
          </div>
        ) : (
          <div className="gvlh-grid">
            {lopList.map(lop => (
              <div
                key={lop.id}
                className={`gvlh-card ${selected?.id === lop.id ? 'active' : ''}`}
                onClick={() => openLop(lop)}
              >
                <div className="gvlh-card-header">
                  <h4>{lop.ten_lop}</h4>
                  <span className={`badge ${TS_MAP[lop.trang_thai] || 'badge-gray'}`}>
                    {TS_LABEL[lop.trang_thai] || lop.trang_thai}
                  </span>
                </div>
                <p className="gvlh-khoa">{lop.khoa_hoc?.ten_khoa}</p>
                <div className="gvlh-meta">
                  <span>👥 {lop.hoc_vien_count || 0} học viên</span>
                  <span>📅 {lop.ngay_khai_giang || 'Chưa xác định'}</span>
                </div>
                <div className="gvlh-role">
                  {lop.chuyen_mon === 'ly_thuyet' && <span className="badge badge-info">📖 Lý thuyết</span>}
                  {lop.chuyen_mon === 'thuc_hanh' && <span className="badge badge-success">🚗 Thực hành</span>}
                  {lop.chuyen_mon === 'ca_hai'    && <><span className="badge badge-info">📖 LT</span><span className="badge badge-success">🚗 TH</span></>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Chi tiết lớp */}
      {selected && (
        <div className="gvlh-detail">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            📋 Chi tiết: {selected.ten_lop}
          </h3>

          {/* Học viên */}
          <div className="card">
            <div className="card-header"><h3>👥 Danh Sách Học Viên ({hocVienList.length})</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {hocVienList.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}><span>👥</span><p>Chưa có học viên</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>#</th><th>Họ tên</th><th>CCCD</th><th>SĐT</th><th>Buổi LT</th><th>Km TH</th><th>ĐK thi</th></tr></thead>
                  <tbody>
                    {hocVienList.map((hv, i) => (
                      <tr key={hv.id}>
                        <td>{i + 1}</td>
                        <td><strong>{hv.ho_ten}</strong></td>
                        <td><code style={{ fontSize: 11 }}>{hv.so_cccd}</code></td>
                        <td>{hv.so_dien_thoai || '—'}</td>
                        <td>{hv.so_buoi_ly_thuyet_da_hoc || 0} buổi</td>
                        <td>{hv.so_km_da_chay || 0} km</td>
                        <td>
                          <span className={`badge ${hv.du_dieu_kien_thi_tn ? 'badge-success' : 'badge-warning'}`}>
                            {hv.du_dieu_kien_thi_tn ? '✅ Đủ ĐK' : '⏳ Chưa đủ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Lịch học */}
          <div className="card">
            <div className="card-header"><h3>📅 Lịch Học Sắp Tới</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {lichHocList.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}><span>📅</span><p>Chưa có lịch học</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Ngày</th><th>Giờ</th><th>Loại</th><th>Địa điểm</th></tr></thead>
                  <tbody>
                    {lichHocList.slice(0, 10).map(lh => (
                      <tr key={lh.id}>
                        <td>{new Date(lh.ngay_hoc).toLocaleDateString('vi-VN')}</td>
                        <td>{lh.gio_bat_dau?.slice(0, 5)} – {lh.gio_ket_thuc?.slice(0, 5)}</td>
                        <td>
                          <span className={`badge ${lh.loai_buoi === 'ly_thuyet' ? 'badge-info' : 'badge-success'}`}>
                            {lh.loai_buoi === 'ly_thuyet' ? '📖 Lý thuyết' : '🚗 Thực hành'}
                          </span>
                        </td>
                        <td>{lh.dia_diem || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GVLopHoc
