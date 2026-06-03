import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [token, setToken]       = useState(localStorage.getItem('userToken') || '')
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )
  const [hoSo, setHoSo]         = useState(null)
  const [loading, setLoading]   = useState(false)

  const backendUrl = 'http://localhost:8000'

  // Dùng ref để logout có thể gọi từ interceptor mà không bị stale closure
  const logoutRef = useRef(null)

  const login = (newToken, info) => {
    setToken(newToken)
    setUserInfo(info)
    localStorage.setItem('userToken', newToken)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = (message) => {
    setToken('')
    setUserInfo(null)
    setHoSo(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
    if (message) {
      // Lưu thông báo để trang Login hiển thị
      localStorage.setItem('logoutMessage', message)
    }
  }

  logoutRef.current = logout

  // Axios interceptor: tự động logout khi hồ sơ bị xóa (403 HO_SO_DELETED)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        const data = err.response?.data
        if (
          err.response?.status === 403 &&
          (data?.code === 'HO_SO_DELETED' || data?.message?.includes('Hồ sơ học viên không còn tồn tại'))
        ) {
          logoutRef.current('Hồ sơ của bạn đã bị xóa khỏi hệ thống. Vui lòng liên hệ trung tâm.')
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  // Tự động fetch hồ sơ khi có token
  useEffect(() => {
    if (!token) return
    setLoading(true)
    axios.get(`${backendUrl}/api/hoc-vien/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setHoSo(res.data.data) })
      .catch(err => {
        // Nếu token hết hạn hoặc hồ sơ bị xóa → logout
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout()
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  return (
    <UserContext.Provider value={{ token, userInfo, hoSo, loading, backendUrl, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
