import { createContext, useContext, useState, useEffect } from 'react'
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

  const login = (newToken, info) => {
    setToken(newToken)
    setUserInfo(info)
    localStorage.setItem('userToken', newToken)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
    setHoSo(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
  }

  // Tự động fetch hồ sơ khi có token
  useEffect(() => {
    if (!token) return
    setLoading(true)
    axios.get(`${backendUrl}/api/hoc-vien/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { if (res.data.success) setHoSo(res.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return (
    <UserContext.Provider value={{ token, userInfo, hoSo, loading, backendUrl, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
