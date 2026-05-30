import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import KhoaHoc from './pages/KhoaHoc/KhoaHoc'
import KhoaHocChiTiet from './pages/KhoaHoc/KhoaHocChiTiet'
import LienHe from './pages/LienHe/LienHe'
import DangKy from './pages/DangKy/DangKy'
import TinTuc from './pages/TinTuc/TinTuc'

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <main>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/khoa-hoc"       element={<KhoaHoc />} />
          <Route path="/khoa-hoc/:slug" element={<KhoaHocChiTiet />} />
          <Route path="/lien-he"        element={<LienHe />} />
          <Route path="/dang-ky"        element={<DangKy />} />
          <Route path="/tin-tuc"        element={<TinTuc />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
