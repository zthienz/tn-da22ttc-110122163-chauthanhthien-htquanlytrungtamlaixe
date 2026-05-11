import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const [token, setToken]       = useState(localStorage.getItem('adminToken') || '')
  const [adminInfo, setAdminInfo] = useState(
    JSON.parse(localStorage.getItem('adminInfo') || 'null')
  )

  const backendUrl = 'http://localhost:8000'

  const login = (newToken, info) => {
    setToken(newToken)
    setAdminInfo(info)
    localStorage.setItem('adminToken', newToken)
    localStorage.setItem('adminInfo', JSON.stringify(info))
  }

  const logout = () => {
    setToken('')
    setAdminInfo(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
  }

  // Kiểm tra quyền
  const isAdmin      = adminInfo?.role === 'admin'
  const isGiangVien  = adminInfo?.role === 'giang_vien'

  return (
    <AdminContext.Provider value={{
      token, adminInfo, backendUrl,
      isAdmin, isGiangVien,
      login, logout,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
