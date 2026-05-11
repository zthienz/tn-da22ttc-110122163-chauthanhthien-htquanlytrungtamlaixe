import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../context/UserContext'
import './HocPhi.css'

const HocPhi = () => {
  const { token, backendUrl } = useUser()
  const [hocPhi, setHocPhi]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    axios.get(`${backendUrl}/api/hoc-phi/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setHocPhi(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const fmt = n => Number(n).toLocaleString('vi-VN')
  const trangThaiMap = {
    chua_thanh_toan:      { text: 'Chưa thanh toán',    cls: 'badge-danger' },
    thanh_toan_mot_phan:  { text: 'Thanh toán một phần',cls: 'badge-warning' },
    da_thanh_toan:        { text: 'Đã thanh toán',       cls: 'badge-success' },
  }

  return (
    <div className="hocphi-page">
      <div className="page-header">
        <div>
          <h2>💳 Học Phí</h2>
          <p>Theo dõi trạng thái học phí và lịch sử thanh toán</p>
        </div>
      </div>

      {loading ? (
        <div className="hp-loading"><div className="spinner" /></div>
      ) : hocPhi.length === 0 ? (
        <div className="hp-empty">
          <span>💳</span>
          <h3>Chưa có thông tin học phí</h3>
          <p>Thông tin học phí sẽ được cập nhật sau khi đăng ký khóa học</p>
        </div>
      ) : (
        <div className="hp-list">
          {hocPhi.map(hp => {
            const ts = trangThaiMap[hp.trang_thai] || { text: hp.trang_thai, cls: 'badge-gray' }
            const pct = hp.so_tien > 0 ? Math.round((hp.da_thanh_toan / hp.so_tien) * 100) : 0
            return (
              <div key={hp.id} className="hp-card">
                <div className="hp-card-header">
                  <div>
                    <h4>{hp.khoa_hoc?.ten_khoa}</h4>
                    <p>Hạng {hp.khoa_hoc?.loai_bang}</p>
                  </div>
                  <span className={`badge ${ts.cls}`}>{ts.text}</span>
                </div>

                <div className="hp-amounts">
                  <div className="hp-amount-item">
                    <span>Tổng học phí</span>
                    <strong>{fmt(hp.so_tien)} VNĐ</strong>
                  </div>
                  <div className="hp-amount-item">
                    <span>Đã thanh toán</span>
                    <strong className="paid">{fmt(hp.da_thanh_toan)} VNĐ</strong>
                  </div>
                  <div className="hp-amount-item">
                    <span>Còn lại</span>
                    <strong className="remain">{fmt(hp.so_tien - hp.da_thanh_toan)} VNĐ</strong>
                  </div>
                </div>

                <div className="hp-progress">
                  <div className="hp-progress-bar">
                    <div className="hp-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span>{pct}% đã thanh toán</span>
                </div>

                {hp.han_thanh_toan && (
                  <p className="hp-deadline">⏰ Hạn thanh toán: {hp.han_thanh_toan}</p>
                )}

                {/* Lịch sử thanh toán */}
                {hp.thanh_toan?.length > 0 && (
                  <div className="hp-history">
                    <h5>Lịch sử thanh toán</h5>
                    {hp.thanh_toan.map((tt, i) => (
                      <div key={i} className="hp-history-item">
                        <span className="hhi-date">{new Date(tt.ngay_thanh_toan).toLocaleDateString('vi-VN')}</span>
                        <span className="hhi-method">{tt.phuong_thuc}</span>
                        <span className="hhi-amount">+{fmt(tt.so_tien)} VNĐ</span>
                        <span className={`badge ${tt.trang_thai === 'thanh_cong' ? 'badge-success' : 'badge-danger'}`}>
                          {tt.trang_thai === 'thanh_cong' ? 'Thành công' : 'Thất bại'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HocPhi
