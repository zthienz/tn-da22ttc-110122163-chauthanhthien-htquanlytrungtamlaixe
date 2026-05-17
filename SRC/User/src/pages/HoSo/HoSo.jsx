import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import './HoSo.css'

const HoSo = () => {
  const { token, hoSo, userInfo, backendUrl } = useUser()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    ho_ten:        hoSo?.ho_ten        || userInfo?.ho_ten || '',
    so_dien_thoai: hoSo?.so_dien_thoai || userInfo?.so_dien_thoai || '',
    so_cccd:       hoSo?.so_cccd       || '',
    ngay_sinh:     hoSo?.ngay_sinh     || '',
    dia_chi:       hoSo?.dia_chi       || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.put(`${backendUrl}/api/hoc-vien/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Cập nhật hồ sơ thành công!')
        setEditing(false)
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Lỗi kết nối server')
    } finally {
      setSaving(false)
    }
  }

  const trangThaiMap = {
    cho_dong_hoc_phi:      { text: 'Chờ đóng học phí',     cls: 'badge-warning', icon: '⏳' },
    cho_mo_lop:            { text: 'Chờ mở lớp',            cls: 'badge-info',    icon: '🕐' },
    dang_hoc:              { text: 'Đang học',               cls: 'badge-success', icon: '📚' },
    chua_du_dieu_kien_thi: { text: 'Chưa đủ điều kiện thi', cls: 'badge-danger',  icon: '⚠️' },
    du_dieu_kien_thi_tn:   { text: 'Đủ điều kiện thi TN',   cls: 'badge-blue',    icon: '✅' },
    hoan_thanh_tn:         { text: 'Hoàn thành tốt nghiệp', cls: 'badge-success', icon: '🎓' },
    da_cap_bang:           { text: 'Đã cấp bằng lái',       cls: 'badge-success', icon: '🏆' },
  }
  const ts = trangThaiMap[hoSo?.trang_thai] || { text: '—', cls: 'badge-gray', icon: '❓' }

  const fields = [
    { name:'ho_ten',        label:'Họ và tên',       type:'text' },
    { name:'so_dien_thoai', label:'Số điện thoại',   type:'tel' },
    { name:'so_cccd',       label:'Số CCCD',          type:'text' },
    { name:'ngay_sinh',     label:'Ngày sinh',        type:'date' },
    { name:'dia_chi',       label:'Địa chỉ',          type:'text' },
  ]

  return (
    <div className="hoso-page">
      <div className="page-header">
        <div>
          <h2>👤 Hồ Sơ Cá Nhân</h2>
          <p>Thông tin cá nhân và trạng thái học tập của bạn</p>
        </div>
        {!editing && (
          <button className="btn-edit" onClick={() => setEditing(true)}>✏️ Chỉnh sửa</button>
        )}
      </div>

      <div className="hoso-grid">
        {/* Card trái — Avatar + trạng thái */}
        <div className="hoso-profile-card">
          <div className="hoso-avatar">
            {hoSo?.anh_the ? (
              <img
                src={`/${hoSo.anh_the}`}
                alt="avatar"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentNode.querySelector('.avatar-fallback').style.display = 'flex'
                }}
              />
            ) : null}
            <span
              className="avatar-fallback"
              style={{ display: hoSo?.anh_the ? 'none' : 'flex' }}
            >
              {(hoSo?.ho_ten || userInfo?.ho_ten || 'H').charAt(0).toUpperCase()}
            </span>
          </div>
          <h3>{hoSo?.ho_ten || userInfo?.ho_ten}</h3>
          <p className="hoso-email">{hoSo?.so_cccd ? `CCCD: ${hoSo.so_cccd}` : userInfo?.email}</p>

          <div className="hoso-status">
            <span className="hoso-status-icon">{ts.icon}</span>
            <div>
              <p className="hoso-status-label">Trạng thái</p>
              <span className={`badge ${ts.cls}`}>{ts.text}</span>
            </div>
          </div>

          {hoSo?.khoa_hoc && (
            <div className="hoso-khoa">
              <p className="hoso-khoa-label">Khóa học đang theo học</p>
              <p className="hoso-khoa-name">{hoSo.khoa_hoc.ten_khoa}</p>
              <span className="badge badge-blue">Hạng {hoSo.khoa_hoc.loai_bang}</span>
            </div>
          )}

        </div>

        {/* Card phải — Thông tin chi tiết */}
        <div className="hoso-detail-card">
          <h3>Thông Tin Cá Nhân</h3>
          {editing ? (
            <div className="hoso-form">
              {fields.map(f => (
                <div key={f.name} className="hf-group">
                  <label>{f.label}</label>
                  <input type={f.type} name={f.name} value={form[f.name]}
                    onChange={handleChange} />
                </div>
              ))}
              <div className="hoso-form-actions">
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
                <button className="btn-cancel" onClick={() => setEditing(false)}>Hủy</button>
              </div>
            </div>
          ) : (
            <div className="hoso-info-list">
              {[
                { icon:'👤', label:'Họ và tên',     value: hoSo?.ho_ten || userInfo?.ho_ten || '—' },
                { icon:'✉️', label:'Email',          value: hoSo?.email || '—' },
                { icon:'📞', label:'Điện thoại',     value: hoSo?.so_dien_thoai || userInfo?.so_dien_thoai || '—' },
                { icon:'🪪', label:'Số CCCD',        value: hoSo?.so_cccd || '—' },
                { icon:'🎂', label:'Ngày sinh',      value: hoSo?.ngay_sinh ? new Date(hoSo.ngay_sinh).toLocaleDateString('vi-VN') : '—' },
                { icon:'📍', label:'Địa chỉ',        value: hoSo?.dia_chi || '—' },
                { icon:'📅', label:'Ngày đăng ký',   value: hoSo?.created_at ? new Date(hoSo.created_at).toLocaleDateString('vi-VN') : '—' },
                { icon:'🌐', label:'Nguồn đăng ký',  value: hoSo?.nguon_dang_ky === 'online' ? '🌐 Online' : '🏢 Trực tiếp' },
              ].map((item, i) => (
                <div key={i} className="hil-item">
                  <span className="hil-icon">{item.icon}</span>
                  <div>
                    <p className="hil-label">{item.label}</p>
                    <p className="hil-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HoSo
