import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminProvider, useAdmin } from './context/AdminContext'
import AdminLayout from './components/Layout/AdminLayout'
import Login from './pages/Login/Login'

// Admin pages
import Dashboard from './pages/Dashboard/Dashboard'
import HoSoManagement from './pages/HoSo/HoSoManagement'
import BangLaiManagement from './pages/BangLai/BangLaiManagement'
import KhoaHocDaoTaoManagement from './pages/KhoaHocDaoTao/KhoaHocDaoTaoManagement'
import LopHocManagement from './pages/LopHoc/LopHocManagement'
import LichHocManagement from './pages/LichHoc/LichHocManagement'
import ThiManagement from './pages/Thi/ThiManagement'
import GiangVienManagement from './pages/GiangVien/GiangVienManagement'
import HocPhiManagement from './pages/HocPhi/HocPhiManagement'
import XeManagement from './pages/Xe/XeManagement'

import CapBangManagement from './pages/CapBang/CapBangManagement'
import LienHeManagement from './pages/LienHe/LienHeManagement'
import BaiThiManagement from './pages/BaiThi/BaiThiManagement'

// Giảng viên pages
import GVThongTin from './pages/GiangVien/GVThongTin'
import GVLopHoc from './pages/GiangVien/GVLopHoc'
import GVDiemDanh from './pages/GiangVien/GVDiemDanh'
import GVXe from './pages/GiangVien/GVXe'
import GVLichDay from './pages/GiangVien/GVLichDay'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, isAdmin } = useAdmin()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { isAdmin } = useAdmin()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard — cả 2 role đều thấy nhưng nội dung khác nhau */}
        <Route index element={<Dashboard />} />

        {/* ── ADMIN ONLY ── */}
        <Route path="ho-so"           element={<ProtectedRoute adminOnly><HoSoManagement /></ProtectedRoute>} />
        <Route path="bang-lai"        element={<ProtectedRoute adminOnly><BangLaiManagement /></ProtectedRoute>} />
        <Route path="khoa-hoc"        element={<ProtectedRoute adminOnly><KhoaHocDaoTaoManagement /></ProtectedRoute>} />
        <Route path="lop-hoc"         element={<ProtectedRoute adminOnly><LopHocManagement /></ProtectedRoute>} />
        <Route path="lich-hoc"   element={<ProtectedRoute adminOnly><LichHocManagement /></ProtectedRoute>} />
        <Route path="thi"        element={<ProtectedRoute adminOnly><ThiManagement /></ProtectedRoute>} />
        <Route path="cap-bang"   element={<ProtectedRoute adminOnly><CapBangManagement /></ProtectedRoute>} />
        <Route path="giang-vien" element={<ProtectedRoute adminOnly><GiangVienManagement /></ProtectedRoute>} />
        <Route path="hoc-phi"    element={<ProtectedRoute adminOnly><HocPhiManagement /></ProtectedRoute>} />
        <Route path="xe"         element={<ProtectedRoute adminOnly><XeManagement /></ProtectedRoute>} />
        <Route path="lien-he"   element={<ProtectedRoute adminOnly><LienHeManagement /></ProtectedRoute>} />
        <Route path="bai-thi"        element={<ProtectedRoute adminOnly><BaiThiManagement /></ProtectedRoute>} />

        {/* ── GIẢNG VIÊN ONLY ── */}
        <Route path="thong-tin-ca-nhan" element={<GVThongTin />} />
        <Route path="lop-cua-toi"       element={<GVLopHoc />} />
        <Route path="lich-day"          element={<GVLichDay />} />
        <Route path="diem-danh"         element={<GVDiemDanh />} />
        <Route path="xe-cua-toi"        element={<GVXe />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = () => (
  <AdminProvider>
    <ToastContainer position="top-right" autoClose={3000} />
    <AppRoutes />
  </AdminProvider>
)

export default App
