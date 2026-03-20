import { createContext, useContext, useState } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [nurse, setNurse] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(staffId, password) {
    setLoading(true)
    setError('')
    try {
      const data = await api.login({ staffId, password })
      setNurse(data.nurse)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    setNurse(null)
  }

  return (
    <AuthContext.Provider value={{ nurse, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
