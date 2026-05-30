import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const TeacherContext = createContext()

export const TeacherProvider = ({ children }) => {
  const [token, setToken]         = useState(localStorage.getItem('teacherToken') || '')
  const [teacherInfo, setTeacherInfo] = useState(
    JSON.parse(localStorage.getItem('teacherInfo') || 'null')
  )

  const backendUrl = ''  // dùng Vite proxy → tránh CORS

  // Tự động fetch anh_dai_dien sau khi có token
  useEffect(() => {
    if (!token || teacherInfo?.anh_dai_dien !== undefined) return
    axios.get('/api/giang-vien/thong-tin', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        const updated = { ...teacherInfo, anh_dai_dien: res.data.data.anh_dai_dien }
        setTeacherInfo(updated)
        localStorage.setItem('teacherInfo', JSON.stringify(updated))
      }
    }).catch(() => {})
  }, [token])

  const login = (newToken, info) => {
    setToken(newToken)
    setTeacherInfo(info)
    localStorage.setItem('teacherToken', newToken)
    localStorage.setItem('teacherInfo', JSON.stringify(info))
  }

  const logout = () => {
    setToken('')
    setTeacherInfo(null)
    localStorage.removeItem('teacherToken')
    localStorage.removeItem('teacherInfo')
  }

  const isGiangVien = teacherInfo?.role === 'giang_vien'

  return (
    <TeacherContext.Provider value={{
      token, teacherInfo, backendUrl,
      isGiangVien,
      login, logout,
    }}>
      {children}
    </TeacherContext.Provider>
  )
}

export const useTeacher = () => useContext(TeacherContext)
