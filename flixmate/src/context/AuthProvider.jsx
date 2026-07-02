import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const ADMIN_USER = 'AhmadAdmin'
const ADMIN_PASS = 'Flixmate2026_Secure'
const AUTH_KEY = 'flixmate_admin_auth'

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY)
    setIsAdmin(saved === 'true')
  }, [])

  const loginAdmin = (username, password) => {
    const ok = username === ADMIN_USER && password === ADMIN_PASS
    if (ok) {
      setIsAdmin(true)
      localStorage.setItem(AUTH_KEY, 'true')
    }
    return ok
  }

  const logoutAdmin = () => {
    setIsAdmin(false)
    localStorage.setItem(AUTH_KEY, 'false')
  }

  const value = useMemo(
    () => ({ isAdmin, loginAdmin, logoutAdmin, adminCredentialsHint: { username: ADMIN_USER, password: ADMIN_PASS } }),
    [isAdmin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
