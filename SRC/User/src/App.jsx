import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider, useUser } from './context/UserContext'
import UserLayout from './components/Layout/UserLayout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import LichHoc from './pages/LichHoc/LichHoc'
import TienDo from './pages/TienDo/TienDo'
import KetQuaThi from './pages/KetQuaThi/KetQuaThi'
import HocPhi from './pages/HocPhi/HocPhi'
import HoSo from './pages/HoSo/HoSo'

const ProtectedRoute = ({ children }) => {
  const { token } = useUser()
  return token ? children : <Navigate to="/login" replace />
}

const AppRoutes = () => (
  <Routes>
    {/* Chỉ có trang đăng nhập — không có đăng ký */}
    <Route path="/login" element={<Login />} />

    {/* Redirect mọi route không xác định về login */}
    <Route path="/" element={
      <ProtectedRoute>
        <UserLayout />
      </ProtectedRoute>
    }>
      <Route index               element={<Dashboard />} />
      <Route path="lich-hoc"     element={<LichHoc />} />
      <Route path="tien-do"      element={<TienDo />} />
      <Route path="ket-qua-thi"  element={<KetQuaThi />} />
      <Route path="hoc-phi"      element={<HocPhi />} />
      <Route path="ho-so"        element={<HoSo />} />
    </Route>

    {/* Catch all */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
)

const App = () => (
  <UserProvider>
    <ToastContainer position="top-right" autoClose={3000} />
    <AppRoutes />
  </UserProvider>
)

export default App
