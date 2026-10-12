import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, getToken, setToken, userApi } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])

  const enrichUser = (rawUser, payload) => {
    if (!rawUser) return null
    return {
      ...rawUser,
      is_pro: payload?.is_pro !== undefined ? Boolean(payload.is_pro) : Boolean(rawUser.is_pro),
      subscription_tier: payload?.subscription_tier || rawUser.subscription_tier || 'free',
    }
  }

  useEffect(() => {
    const token = getToken()
    if (token) {
      authApi.getUser()
        .then((res) => {
          if (res?.user) {
            setUser(enrichUser(res.user, res))
            loadFavorites()
          } else {
            setToken(null)
          }
        })
        .catch(() => {
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const loadFavorites = async () => {
    try {
      const res = await userApi.getFavorites()
      if (res?.favorites) setFavorites(res.favorites)
    } catch {
      // ignore
    }
  }

  const login = async (email, password) => {
    const res = await authApi.login(email, password)
    if (res?.token) {
      setToken(res.token)
      setUser(enrichUser(res.user, res))
      loadFavorites()
    }
    return res
  }

  const register = async (name, email, password, password_confirmation) => {
    const res = await authApi.register(name, email, password, password_confirmation)
    if (res?.token) {
      setToken(res.token)
      setUser(enrichUser(res.user, res))
      loadFavorites()
    }
    return res
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    setToken(null)
    setUser(null)
    setFavorites([])
  }

  const toggleFavorite = async (toolSlug) => {
    if (!user) return false
    try {
      const res = await userApi.toggleFavorite(toolSlug)
      if (res.is_favorite) {
        setFavorites((prev) => [...prev, toolSlug])
      } else {
        setFavorites((prev) => prev.filter((s) => s !== toolSlug))
      }
      return res.is_favorite
    } catch {
      return false
    }
  }

  const value = {
    user,
    loading,
    favorites,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    isPro: Boolean(user?.is_pro || user?.subscription_tier === 'pro' || user?.role === 'admin'),
    login,
    register,
    logout,
    toggleFavorite,
    reloadUser: async () => {
      const res = await authApi.getUser()
      if (res?.user) setUser(enrichUser(res.user, res))
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
