import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cc_user')
    const storedToken = localStorage.getItem('cc_token')
    if (stored && storedToken) {
      setUser(JSON.parse(stored))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('cc_user', JSON.stringify(userData))
    localStorage.setItem('cc_token', authToken)
  }
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('cc_user')
    localStorage.removeItem('cc_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
