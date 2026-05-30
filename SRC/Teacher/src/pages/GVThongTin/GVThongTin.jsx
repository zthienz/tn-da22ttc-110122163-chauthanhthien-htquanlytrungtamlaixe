import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTeacher } from '../../context/TeacherContext'
import './GVThongTin.css'

const CM_MAP = { ly_thuyet: '📖 Lý thuyết', thuc_hanh: '🚗 Thực hành', ca_hai: '📖🚗 Cả hai' }

const GVThongTin = () => {
  const { token, teacherInfo, backendUrl } = useTeacher()
  const [giangVien, setGiangVien]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showDMK, setShowDMK]       = useState(false)
  const [dmkForm, setDmkForm]       = useState({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' })
  const [savingDMK, setSavingDMK]   = useState(false)
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${backendUrl}/api/giang-vien/thong-tin`, { headers })
      .then(res => { if (res.data.success) setGiangVien(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDoiMatKhau = async e => {
    e.preventDefault()
    if (dmkForm.mat_khau_moi !== dmkForm.xac_nhan) {
      toast.error('Mật khẩu xác nhận không khớp'); return
    }
    if (dmkForm.mat_khau_moi.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự'); return
    }
    setSavingDMK(true)
    try {
      const res = await axios.post(`${backendUrl}/api/auth/doi-mat-khau`, {
        mat_khau_cu:  dmkForm.mat_khau_cu,
        mat_khau_moi: dmkForm.mat_khau_moi,
      }, { headers })
      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công!')
        setShowDMK(false)
        setDmkForm({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' })
      } else toast.error(res.data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi đổi mật khẩu') }
    setSavingDMK(false)
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  const anhUrl = giangVien?.anh_dai_dien ? `/uploads/${giangVien.anh_dai_dien}` : null

  return (
    <div className="gvtt-page">
      <div className="page-header">
        <div><h2>👤 Thông Tin Cá Nhân</h2><p>Thông tin tài khoản giảng viên của bạn</p></div>
        <button className="btn btn-outline" onClick={() => setShowDMK(true)}>🔑 Đổi mật khẩu</button>
      </div>

      <div className="gvtt-grid">
        {/* Profile card */}
        <div className="gvtt-profile-card">
          {/* Ảnh đại diện */}
          <div className="gvtt-anh-wrap">
            {anhUrl ? (
              <img src={anhUrl} alt={teacherInfo?.ho_ten} className="gvtt-anh"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            ) : null}
            <div className="gvtt-anh-fallback" style={{display: anhUrl ? 'none' : 'flex'}}>
              {teacherInfo?.ho_ten?.charAt(0).toUpperCase() || 'G'}
            </div>
          </div>

          <h3 className="gvtt-name">{teacherInfo?.ho_ten}</h3>
          <p className="gvtt-email">{teacherInfo?.email}</p>
          <span className={`badge ${giangVien?.chuyen_mon === 'thuc_hanh' ? 'badge-success' : 'badge-info'}`}
            style={{ marginTop: 8, fontSize: 13 }}>
            {CM_MAP[giangVien?.chuyen_mon] || '—'}
          </span>
          <div className="gvtt-stats">
            <div className="gvtt-stat">
              <span>{giangVien?.nam_kinh_nghiem || 0}</span>
              <p>Năm KN</p>
            </div>
            <div className="gvtt-stat">
              <span>{giangVien?.lop_count || 0}</span>
              <p>Lớp dạy</p>
            </div>
          </div>
        </div>

        {/* Detail card */}
        <div className="card">
          <div className="card-header"><h3>📋 Chi Tiết Thông Tin</h3></div>
          <div className="card-body">
            {[
              { icon: '👤', label: 'Họ và tên',       value: teacherInfo?.ho_ten },
              { icon: '✉️', label: 'Email đăng nhập', value: teacherInfo?.email },
              { icon: '📞', label: 'Số điện thoại',   value: teacherInfo?.so_dien_thoai || '—' },
              { icon: '🎓', label: 'Bằng cấp',         value: giangVien?.bang_cap || '—' },
              { icon: '⭐', label: 'Kinh nghiệm',      value: `${giangVien?.nam_kinh_nghiem || 0} năm` },
              { icon: '📚', label: 'Chuyên môn',       value: CM_MAP[giangVien?.chuyen_mon] || '—' },
              { icon: '📝', label: 'Ghi chú',          value: giangVien?.ghi_chu || '—' },
            ].map((item, i) => (
              <div key={i} className="gvtt-info-row">
                <span className="gvtt-info-icon">{item.icon}</span>
                <div>
                  <p className="gvtt-info-label">{item.label}</p>
                  <p className="gvtt-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL ĐỔI MẬT KHẨU ── */}
      {showDMK && (
        <div className="modal-overlay" onClick={() => setShowDMK(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 Đổi Mật Khẩu</h3>
              <button className="modal-close" onClick={() => setShowDMK(false)}>✕</button>
            </div>
            <form onSubmit={handleDoiMatKhau}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input type="password" value={dmkForm.mat_khau_cu}
                    onChange={e => setDmkForm({ ...dmkForm, mat_khau_cu: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại" required />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input type="password" value={dmkForm.mat_khau_moi}
                    onChange={e => setDmkForm({ ...dmkForm, mat_khau_moi: e.target.value })}
                    placeholder="Ít nhất 6 ký tự" required />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input type="password" value={dmkForm.xac_nhan}
                    onChange={e => setDmkForm({ ...dmkForm, xac_nhan: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDMK(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={savingDMK}>
                  {savingDMK ? 'Đang lưu...' : '💾 Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GVThongTin
