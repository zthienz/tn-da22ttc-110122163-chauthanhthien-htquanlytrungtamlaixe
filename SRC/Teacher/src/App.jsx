import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { TeacherProvider, useTeacher } from './context/TeacherContext'
import TeacherLayout from './components/Layout/TeacherLayout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import GVThongTin from './pages/GVThongTin/GVThongTin'
import GVLopHoc from './pages/GVLopHoc/GVLopHoc'
import GVXe from './pages/GVXe/GVXe'
import GVLichHoc from './pages/GVLichHoc/GVLichHoc'

const ProtectedRoute = ({ children }) => {
  const { token, isGiangVien } = useTeacher()
  if (!token) return <Navigate to="/login" replace />
  if (!isGiangVien) return <Navigate to="/login" replace />
  return children
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={
      <ProtectedRoute>
        <TeacherLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Dashboard />} />
      <Route path="thong-tin" element={<GVThongTin />} />
      <Route path="lop-hoc"   element={<GVLopHoc />} />
      <Route path="lich-hoc"  element={<GVLichHoc />} />
      <Route path="xe"        element={<GVXe />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App = () => (
  <TeacherProvider>
    <ToastContainer position="top-right" autoClose={3000} />
    <AppRoutes />
  </TeacherProvider>
)

export default App
