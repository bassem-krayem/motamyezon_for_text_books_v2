import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { tokenStore } from '../api/client'
import { authApi } from '../api/resources'

const AuthContext = createContext(null)

// The signup/login responses nest the user under data.user, while GET
// /users/me returns it directly under data. Normalise both.
const extractUser = (payload) => payload?.data?.user || payload?.data || null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if we have a stored token try to resolve the current user.
  useEffect(() => {
    let active = true
    async function bootstrap() {
      if (!tokenStore.get()) {
        setLoading(false)
        return
      }
      try {
        const res = await authApi.getMe()
        if (active) setUser(extractUser(res))
      } catch {
        // Invalid/expired token — the client interceptor already cleared it.
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [])

  const handleAuthSuccess = useCallback((res) => {
    if (res?.token) tokenStore.set(res.token)
    const u = extractUser(res)
    setUser(u)
    return u
  }, [])

  const login = useCallback(
    async (credentials) => handleAuthSuccess(await authApi.login(credentials)),
    [handleAuthSuccess],
  )

  const signup = useCallback(
    async (body) => handleAuthSuccess(await authApi.signup(body)),
    [handleAuthSuccess],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the server call fails, clear the local session.
    } finally {
      tokenStore.clear()
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await authApi.getMe()
    const u = extractUser(res)
    setUser(u)
    return u
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      refreshUser,
      setUser,
      handleAuthSuccess,
    }),
    [user, loading, login, signup, logout, refreshUser, handleAuthSuccess],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
