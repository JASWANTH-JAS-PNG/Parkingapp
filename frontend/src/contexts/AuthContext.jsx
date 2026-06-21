/**
 * AuthContext — session-scoped auth (sessionStorage, not localStorage).
 * PRD §10: "store JWT in sessionStorage to reduce XSS exposure window"
 *
 * Decoded JWT claims (.NET long-form URIs):
 *   ClaimTypes.Name            → userName
 *   ClaimTypes.NameIdentifier  → userId (GUID string from IdentityUser)
 */
import { createContext, useContext, useState, useEffect } from 'react'

const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const CLAIM_ID   = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

function decodeJwt(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch { return {} }
}

export function parseToken(token) {
  const p = decodeJwt(token)
  return {
    userName: p[CLAIM_NAME]  || p.unique_name || '',
    userId:   p[CLAIM_ID]    || p.nameid      || '',   // GUID string
  }
}

const KEY_TOKEN = 'pw_token'
const KEY_USER  = 'pw_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = sessionStorage.getItem(KEY_TOKEN)
    if (t) {
      setToken(t)
      setUser(parseToken(t))
    }
    setLoading(false)
  }, [])

  /** Call after successful login OR register — backend returns { token }. */
  const login = (rawToken) => {
    const userData = parseToken(rawToken)
    setToken(rawToken)
    setUser(userData)
    sessionStorage.setItem(KEY_TOKEN, rawToken)
    sessionStorage.setItem(KEY_USER,  JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem(KEY_TOKEN)
    sessionStorage.removeItem(KEY_USER)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
