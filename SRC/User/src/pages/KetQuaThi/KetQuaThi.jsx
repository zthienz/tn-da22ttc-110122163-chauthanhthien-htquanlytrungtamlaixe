import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../context/UserContext'
import './KetQuaThi.css'

const KetQuaThi = () => {
  const { token, backendUrl } = useUser()
  const [ketQua, setKetQua]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    axios.get(`${backendUrl}/api/thi/ket-qua/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setKetQua(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const loaiThiLabel = { tot_nghiep: 'Tốt Nghiệp', sat_hanh: 'Sát Hạch' }

  // Nhóm theo lịch thi
  const grouped = ketQua.reduce((acc, kq) => {
    const key = kq.lich_thi_id
    if (!acc[key]) acc[key] = { lichThi: kq.lich_thi, items: [] }
    acc[key].items.push(kq)
    return acc
  }, {})

  return (
    <div className="kqt-page">
      <div className="page-header">
        <div>
          <h2>🏆 Kết Quả Thi</h2>
          <p>Xem điểm số và trạng thái các bài thi tốt nghiệp và sát hạch</p>
        </div>
      </div>

      {loading ? (
        <div className="kqt-loading"><div className="spinner" /></div>
      ) : ketQua.length === 0 ? (
        <div className="kqt-empty">
          <span>📋</span>
          <h3>Chưa có kết quả thi</h3>
          <p>Kết quả thi sẽ hiển thị sau khi bạn tham gia kỳ thi</p>
        </div>
      ) : (
        <div className="kqt-list">
          {Object.values(grouped).map((group, gi) => {
            const allDat = group.items.every(i => i.ket_qua === 'dat')
            const hasFail = group.items.some(i => i.ket_qua === 'khong_dat')
            return (
              <div key={gi} className="kqt-group">
                <div className="kqt-group-header">
                  <div>
                    <span className={`badge ${group.lichThi?.loai_thi === 'tot_nghiep' ? 'badge-blue' : 'badge-info'}`}>
                      {loaiThiLabel[group.lichThi?.loai_thi] || 'Thi'}
                    </span>
                    <h4>Ngày thi: {group.lichThi?.ngay_thi}</h4>
                    {group.lichThi?.dia_diem && <p>📍 {group.lichThi.dia_diem}</p>}
                  </div>
                  <span className={`badge ${allDat ? 'badge-success' : hasFail ? 'badge-danger' : 'badge-warning'}`}>
                    {allDat ? '✅ Đậu tất cả' : hasFail ? '❌ Có môn rớt' : '⏳ Chờ kết quả'}
                  </span>
                </div>
                <div className="kqt-items">
                  {group.items.map((kq, i) => (
                    <div key={i} className={`kqt-item ${kq.ket_qua}`}>
                      <div className="kqi-left">
                        <span className="kqi-icon">
                          {kq.ket_qua === 'dat' ? '✅' : kq.ket_qua === 'khong_dat' ? '❌' : '⏳'}
                        </span>
                        <div>
                          <p className="kqi-name">{kq.bai_thi?.ten_bai_thi}</p>
                          <p className="kqi-lan">Lần thi: {kq.lan_thi}</p>
                        </div>
                      </div>
                      <div className="kqi-right">
                        {kq.diem !== null && (
                          <span className="kqi-diem">{kq.diem} điểm</span>
                        )}
                        <span className={`badge ${kq.ket_qua === 'dat' ? 'badge-success' : kq.ket_qua === 'khong_dat' ? 'badge-danger' : 'badge-warning'}`}>
                          {kq.ket_qua === 'dat' ? 'Đạt' : kq.ket_qua === 'khong_dat' ? 'Không đạt' : 'Vắng mặt'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default KetQuaThi
