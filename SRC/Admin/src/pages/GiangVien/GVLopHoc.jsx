import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAdmin } from '../../context/AdminContext'
import './GVLopHoc.css'

const GVLopHoc = () => {
  const { token, backendUrl } = useAdmin()
  const [lopList, setLopList]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [hocVienList, setHocVienList] = useState([])
  const [lichHocList, setLichHocList] = useState([])
  const [detailTab, setDetailTab] = useState('hocvien')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/lop-cua-toi`, { headers })
      .then(res => { if (res.data.success) setLopList(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openLop = async lop => {
    setSelected(lop)
    setDetailTab('hocvien')
    try {
      const [r1, r2] = await Promise.all([
        axios.get(`${backendUrl}/api/giang-vien/lop/${lop.id}/hoc-vien`, { headers }),
        axios.get(`${backendUrl}/api/giang-vien/lop/${lop.id}/lich-hoc`, { headers }),
      ])
      if (r1.data.success) setHocVienList(r1.data.data)
      if (r2.data.success) setLichHocList(r2.data.data)
    } catch {}
  }

  const TS_MAP   = { chuan_bi:'badge-info', dang_hoc:'badge-success', da_ket_thuc:'badge-gray' }
  const TS_LABEL = { chuan_bi:'Chuẩn bị', dang_hoc:'Đang học', da_ket_thuc:'Kết thúc' }

  // Lấy xe từ lịch thực hành (unique)
  const xeList = [...new Map(
    lichHocList.filter(l => l.xe).map(l => [l.xe.id, l.xe])
  ).values()]

  // Lấy địa điểm từ lịch lý thuyết (unique)
  const phongList = [...new Set(
    lichHocList.filter(l => l.loai_buoi === 'ly_thuyet' && l.dia_diem).map(l => l.dia_diem)
  )]

  return (
    <div className="gv-lophoc">
      <div className="page-header">
        <div><h2>🏫 Lớp Của Tôi</h2><p>Danh sách lớp học bạn được phân công giảng dạy</p></div>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
        lopList.length === 0 ? (
          <div className="empty-state card" style={{padding:'60px'}}>
            <span>🏫</span>
            <h3>Chưa được phân công lớp nào</h3>
            <p>Vui lòng liên hệ quản trị viên để được phân công lớp dạy</p>
          </div>
        ) : (
          <div className="gvlh-grid">
            {lopList.map(lop => (
              <div key={lop.id} className={`gvlh-card ${selected?.id === lop.id ? 'active' : ''}`}
                onClick={() => openLop(lop)}>
                <div className="gvlh-card-header">
                  <h4>{lop.ten_lop}</h4>
                  <span className={`badge ${TS_MAP[lop.trang_thai]||'badge-gray'}`}>
                    {TS_LABEL[lop.trang_thai]||lop.trang_thai}
                  </span>
                </div>
                <p className="gvlh-khoa">{lop.khoa_hoc?.ten_khoa}</p>
                <div className="gvlh-meta">
                  <span>👥 {lop.hoc_vien_count||0} học viên</span>
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

      {/* Chi tiết lớp được chọn */}
      {selected && (
        <div className="gvlh-detail">
          {/* Tabs */}
          <div style={{display:'flex',gap:4,background:'#f7fafc',borderRadius:10,padding:4,width:'fit-content',marginBottom:16}}>
            {[
              {key:'hocvien', label:`👥 Học viên (${hocVienList.length})`},
              {key:'xe_phong', label: selected.chuyen_mon === 'thuc_hanh' ? `🚗 Xe thực hành (${xeList.length})` : `📍 Phòng học (${phongList.length})`},
              {key:'lichoc', label:`📅 Lịch học (${lichHocList.length})`},
            ].map(t => (
              <button key={t.key}
                style={{padding:'7px 16px',border:'none',background:detailTab===t.key?'#fff':'transparent',
                  borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',
                  color:detailTab===t.key?'#0d47a1':'#718096',
                  boxShadow:detailTab===t.key?'0 1px 4px rgba(0,0,0,.1)':'none'}}
                onClick={() => setDetailTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* Tab: Học viên */}
          {detailTab === 'hocvien' && (
            <div className="card">
              <div className="card-header"><h3>👥 Danh Sách Học Viên ({hocVienList.length})</h3></div>
              <div className="card-body" style={{padding:0}}>
                {hocVienList.length === 0 ? (
                  <div className="empty-state" style={{padding:'32px'}}><span>👥</span><p>Chưa có học viên trong lớp</p></div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Họ tên</th><th>CCCD</th><th>SĐT</th>
                        {selected.chuyen_mon !== 'thuc_hanh' && <th>Buổi LT</th>}
                        {selected.chuyen_mon !== 'ly_thuyet' && <th>Km TH</th>}
                        <th>ĐK thi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hocVienList.map((hv, i) => (
                        <tr key={hv.id}>
                          <td>{i+1}</td>
                          <td><strong>{hv.ho_ten}</strong></td>
                          <td><code style={{fontSize:11}}>{hv.so_cccd}</code></td>
                          <td style={{fontSize:12}}>{hv.so_dien_thoai||'—'}</td>
                          {selected.chuyen_mon !== 'thuc_hanh' && <td>{hv.so_buoi_ly_thuyet_da_hoc||0} buổi</td>}
                          {selected.chuyen_mon !== 'ly_thuyet' && <td>{Number(hv.so_km_da_chay||0).toLocaleString()} km</td>}
                          <td>
                            <span className={`badge ${hv.du_dieu_kien_thi_tn?'badge-success':'badge-warning'}`}>
                              {hv.du_dieu_kien_thi_tn?'✅ Đủ ĐK':'⏳ Chưa đủ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Tab: Xe / Phòng */}
          {detailTab === 'xe_phong' && (
            <div className="card">
              {selected.chuyen_mon === 'thuc_hanh' || selected.chuyen_mon === 'ca_hai' ? (
                <>
                  <div className="card-header"><h3>🚗 Xe Thực Hành Được Phân Công</h3></div>
                  <div className="card-body">
                    {xeList.length === 0 ? (
                      <div className="empty-state" style={{padding:'32px'}}><span>🚗</span><p>Chưa có xe được phân công</p></div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
                        {xeList.map(xe => (
                          <div key={xe.id} style={{background:'#f0f4ff',border:'1px solid #c7d7f9',borderRadius:10,padding:'14px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                              {xe.anh_xe
                                ? <img src={`/uploads/${xe.anh_xe}`} alt={xe.bien_so} style={{width:48,height:36,objectFit:'cover',borderRadius:6}} />
                                : <div style={{width:48,height:36,background:'#e0ecff',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🚗</div>}
                              <div>
                                <p style={{fontWeight:800,fontSize:15,color:'#0d47a1',margin:0}}>{xe.bien_so}</p>
                                <p style={{fontSize:12,color:'#718096',margin:0}}>{xe.hang_xe} {xe.dong_xe}</p>
                              </div>
                            </div>
                            <div style={{fontSize:12,color:'#374151'}}>
                              <span>{xe.loai_xe==='so_san'?'Số sàn':'Số tự động'}</span>
                              <span style={{margin:'0 6px'}}>·</span>
                              <span>Hạng {xe.hang_bang}</span>
                              {xe.mau_xe && <><span style={{margin:'0 6px'}}>·</span><span>{xe.mau_xe}</span></>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="card-header"><h3>📍 Phòng Học Lý Thuyết</h3></div>
                  <div className="card-body">
                    {phongList.length === 0 ? (
                      <div className="empty-state" style={{padding:'32px'}}><span>📍</span><p>Chưa có địa điểm được ghi nhận</p></div>
                    ) : (
                      <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                        {phongList.map((p,i) => (
                          <div key={i} style={{background:'#f0f4ff',border:'1px solid #c7d7f9',borderRadius:8,padding:'10px 16px',fontSize:14,fontWeight:600,color:'#0d47a1'}}>
                            📍 {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Lịch học */}
          {detailTab === 'lichoc' && (
            <div className="card">
              <div className="card-header"><h3>📅 Lịch Học ({lichHocList.length} buổi)</h3></div>
              <div className="card-body" style={{padding:0}}>
                {lichHocList.length === 0 ? (
                  <div className="empty-state" style={{padding:'32px'}}><span>📅</span><p>Chưa có lịch học</p></div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Ngày</th><th>Giờ</th><th>Loại</th><th>Địa điểm</th></tr></thead>
                    <tbody>
                      {lichHocList.slice(0,20).map(lh => (
                        <tr key={lh.id}>
                          <td>{new Date(lh.ngay_hoc).toLocaleDateString('vi-VN')}</td>
                          <td style={{fontSize:12}}>{lh.gio_bat_dau?.slice(0,5)} – {lh.gio_ket_thuc?.slice(0,5)}</td>
                          <td><span className={`badge ${lh.loai_buoi==='ly_thuyet'?'badge-info':'badge-success'}`}>
                            {lh.loai_buoi==='ly_thuyet'?'📖 LT':'🚗 TH'}
                          </span></td>
                          <td style={{fontSize:12}}>{lh.dia_diem||'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GVLopHoc
