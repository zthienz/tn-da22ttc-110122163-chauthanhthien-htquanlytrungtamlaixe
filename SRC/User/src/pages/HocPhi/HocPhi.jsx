import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '../../context/UserContext'
import './HocPhi.css'

const fmt = n => Number(n || 0).toLocaleString('vi-VN')

const PM_LABEL = {
  tien_mat:     '💵 Tiền mặt',
  chuyen_khoan: '🏦 Chuyển khoản',
}

const HocPhi = () => {
  const { token, backendUrl } = useUser()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    axios.get(`${backendUrl}/api/hoc-phi/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setList(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  // Nhóm theo khóa học (ho_so.khoa_hoc_id)
  const grouped = list.reduce((acc, item) => {
    const khoa = item.ho_so?.khoa_hoc
    const key  = khoa?.id || 'unknown'
    if (!acc[key]) acc[key] = { khoa, items: [] }
    acc[key].items.push(item)
    return acc
  }, {})

  const tongThu = list.reduce((s, i) => s + Number(i.so_tien || 0), 0)

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
      ) : list.length === 0 ? (
        <div className="hp-empty">
          <span>💳</span>
          <h3>Chưa có thông tin học phí</h3>
          <p>Thông tin học phí sẽ được cập nhật sau khi đóng học phí</p>
        </div>
      ) : (
        <>
          {/* Tổng kết */}
          <div className="hp-summary">
            <div className="hp-summary-item">
              <span className="hp-summary-icon">📋</span>
              <div>
                <p>Số giao dịch</p>
                <strong>{list.length}</strong>
              </div>
            </div>
            <div className="hp-summary-item green">
              <span className="hp-summary-icon">💰</span>
              <div>
                <p>Tổng đã đóng</p>
                <strong>{fmt(tongThu)} đ</strong>
              </div>
            </div>
            <div className="hp-summary-item blue">
              <span className="hp-summary-icon">✅</span>
              <div>
                <p>Trạng thái</p>
                <strong>Đã đóng đủ</strong>
              </div>
            </div>
          </div>

          {/* Danh sách theo khóa học */}
          {Object.values(grouped).map((group, gi) => (
            <div key={gi} className="hp-card">
              {/* Header khóa học */}
              <div className="hp-card-header">
                <div>
                  <h4>{group.khoa?.ten_khoa || 'Chưa xác định khóa học'}</h4>
                  {group.khoa?.loai_bang && (
                    <span className="badge badge-blue" style={{ fontSize: 12 }}>
                      Hạng {group.khoa.loai_bang}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Tổng đã nộp</div>
                  <strong style={{ fontSize: 20, color: '#16a34a' }}>
                    {fmt(group.items.reduce((s, i) => s + Number(i.so_tien || 0), 0))} đ
                  </strong>
                </div>
              </div>

              {/* Danh sách giao dịch */}
              <div className="hp-history">
                <h5>Lịch sử thanh toán</h5>
                {group.items.map((tt, i) => (
                  <div key={i} className="hp-history-item">
                    <div className="hhi-left">
                      <span className="hhi-icon">💳</span>
                      <div>
                        <div className="hhi-title">
                          {tt.loai_phi === 'phi_thi_lai' ? '🔁 Phí thi lại' : '📚 Học phí'}
                        </div>
                        <div className="hhi-meta">
                          {PM_LABEL[tt.phuong_thuc] || tt.phuong_thuc}
                          {tt.nguoi_thu && <span> · Người thu: {tt.nguoi_thu}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="hhi-right">
                      <strong className="hhi-amount">+{fmt(tt.so_tien)} đ</strong>
                      <div className="hhi-date">
                        {tt.ngay_thanh_toan
                          ? new Date(tt.ngay_thanh_toan).toLocaleDateString('vi-VN')
                          : '—'}
                      </div>
                      <span className={`badge ${tt.trang_thai === 'thanh_cong' ? 'badge-success' : 'badge-danger'}`}
                        style={{ fontSize: 11 }}>
                        {tt.trang_thai === 'thanh_cong' ? '✅ Thành công' : '❌ Thất bại'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default HocPhi
