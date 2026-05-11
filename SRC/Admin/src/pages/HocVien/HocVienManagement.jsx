import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAdmin } from '../../context/AdminContext'
import './HocVienManagement.css'

const HocVienManagement = () => {
  const { token, backendUrl } = useAdmin()
  const [hocVienList, setHocVienList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchHocVien = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/hoc-vien`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) setHocVienList(res.data.data)
    } catch (err) {
      toast.error('Lỗi tải danh sách học viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHocVien() }, [])

  const filtered = hocVienList.filter(hv =>
    hv.ho_ten?.toLowerCase().includes(search.toLowerCase()) ||
    hv.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="management-page">
      <div className="page-header">
        <h2 className="page-title">Quản Lý Học Viên</h2>
        <button className="btn-primary">+ Thêm Học Viên</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <p className="loading-text">Đang tải...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Khóa Học</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="empty-row">Không có dữ liệu</td></tr>
              ) : (
                filtered.map((hv, idx) => (
                  <tr key={hv.id}>
                    <td>{idx + 1}</td>
                    <td>{hv.ho_ten}</td>
                    <td>{hv.email}</td>
                    <td>{hv.so_dien_thoai}</td>
                    <td>{hv.khoa_hoc?.ten_khoa || '—'}</td>
                    <td>
                      <span className={`badge ${hv.trang_thai === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {hv.trang_thai === 'active' ? 'Đang học' : 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn-edit">Sửa</button>
                      <button className="btn-delete">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default HocVienManagement
