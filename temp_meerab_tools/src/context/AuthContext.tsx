import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService, type User } from '../services/authService'
import { ApiError } from '../services/api'
import { useToast } from '../components/ui/Toast'

export type UserData = User

export interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  isLoading: boolean
  login: (
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }>
  register: (
    name: string,
    email: string,
    pass: string,
  ) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }>
  logout: () => Promise<void>
  updateProfile: (params: {
    name?: string
    email?: string
    password?: string
  }) => Promise<{ success: boolean; message?: string }>
  toggleFavorite: (toolId: string) => Promise<boolean>
  isFavorite: (toolId: string) => boolean
  addRecentTool: (toolId: string) => void
  loginAsDemo: () => void
  isAuthModalOpen: boolean
  authModalView: 'login' | 'register' | 'forgot'
  openAuthModal: (view?: 'login' | 'register' | 'forgot') => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => authService.getToken())
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser())
  const [loading, setLoading] = useState<boolean>(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot'>('login')
  const { toast } = useToast()

  // Verify session on mount with Laravel Sanctum backend
  useEffect(() => {
    const existingToken = authService.getToken()
    if (!existingToken) return

    let mounted = true
    authService
      .getUser()
      .then((verifiedUser) => {
        if (!mounted) return
        if (verifiedUser) {
          setUser(verifiedUser)
        } else if (!existingToken.startsWith('demo_')) {
          setToken(null)
          setUser(null)
        }
      })
      .catch(() => {
        /* Keep cached user if server is temporarily unreachable */
      })

    return () => {
      mounted = false
    }
  }, [])

  const openAuthModal = useCallback((view: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalView(view)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const login = useCallback(
    async (
      email: string,
      pass: string,
    ): Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }> => {
      setLoading(true)
      try {
        const res = await authService.login({ email, password: pass })
        setToken(res.token)
        setUser(res.user)
        setIsAuthModalOpen(false)
        toast(`Welcome back, ${res.user.name}!`, 'success')
        return { success: true }
      } catch (err: any) {
        let msg = 'Invalid email or password.'
        let errors: Record<string, string[]> | undefined

        if (err instanceof ApiError) {
          msg = err.data?.message || err.message || msg
          errors = err.errors
        } else if (err?.message) {
          msg = err.message
        }

        toast(msg, 'error')
        return { success: false, message: msg, errors }
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const register = useCallback(
    async (
      name: string,
      email: string,
      pass: string,
    ): Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }> => {
      setLoading(true)
      try {
        const res = await authService.register({ name, email, password: pass })
        setToken(res.token)
        setUser(res.user)
        setIsAuthModalOpen(false)
        toast(`Account created! Welcome to vimz, ${res.user.name}.`, 'success')
        return { success: true }
      } catch (err: any) {
        let msg = 'Registration failed.'
        let errors: Record<string, string[]> | undefined

        if (err instanceof ApiError) {
          msg = err.data?.message || err.message || msg
          errors = err.errors
          if (errors) {
            const firstKey = Object.keys(errors)[0]
            if (firstKey && errors[firstKey][0]) {
              msg = errors[firstKey][0]
            }
          }
        } else if (err?.message) {
          msg = err.message
        }

        toast(msg, 'error')
        return { success: false, message: msg, errors }
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setToken(null)
    setUser(null)
    toast('Logged out successfully.', 'info')
  }, [toast])

  const loginAsDemo = useCallback(() => {
    const demoUser: User = {
      id: 999,
      name: 'Demo Architect',
      email: 'demo@vimz.ai',
      created_at: new Date().toISOString(),
      favoriteToolIds: ['pdf-to-word', 'image-resizer', 'bmi-calculator', 'curl-to-fetch'],
      recentToolIds: ['word-document-fixer', 'password-entropy'],
    }
    const demoToken = `demo_${Date.now()}`
    authService.setToken(demoToken)
    authService.setStoredUser(demoUser)
    setToken(demoToken)
    setUser(demoUser)
    setIsAuthModalOpen(false)
    toast('Logged in as Demo User!', 'success')
  }, [toast])

  const updateProfile = useCallback(
    async (params: {
      name?: string
      email?: string
      password?: string
    }): Promise<{ success: boolean; message?: string }> => {
      if (!token || !user) return { success: false, message: 'Not authenticated' }
      setLoading(true)
      try {
        if (token.startsWith('demo_')) {
          const updated: User = {
            ...user,
            name: params.name || user.name,
            email: params.email || user.email,
          }
          setUser(updated)
          authService.setStoredUser(updated)
          toast('Demo profile updated locally.', 'success')
          return { success: true }
        }

        const updated = await authService.updateProfile(params)
        setUser(updated)
        toast('Profile updated successfully!', 'success')
        return { success: true }
      } catch (err: any) {
        const msg = err.message || 'Failed to update profile.'
        toast(msg, 'error')
        return { success: false, message: msg }
      } finally {
        setLoading(false)
      }
    },
    [token, user, toast],
  )

  const toggleFavorite = useCallback(
    async (toolId: string): Promise<boolean> => {
      if (!user) {
        toast('Please sign in to save tools to your favorites.', 'info')
        openAuthModal('login')
        return false
      }

      const current = user.favoriteToolIds ?? []
      const exists = current.includes(toolId)
      const nextFavorites = exists
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]

      // Optimistically update local state
      const updatedUser: User = { ...user, favoriteToolIds: nextFavorites }
      setUser(updatedUser)
      authService.setStoredUser(updatedUser)

      if (token && !token.startsWith('demo_')) {
        try {
          const res = await authService.toggleFavorite(toolId)
          if (res.favoriteToolIds) {
            const syncedUser: User = {
              ...user,
              favoriteToolIds: res.favoriteToolIds,
            }
            setUser(syncedUser)
            authService.setStoredUser(syncedUser)
          }
        } catch {
          /* keep optimistic update */
        }
      }

      toast(
        exists ? 'Removed from favorites' : 'Saved to favorites!',
        exists ? 'info' : 'success',
      )
      return !exists
    },
    [user, token, toast, openAuthModal],
  )

  const isFavorite = useCallback(
    (toolId: string): boolean => {
      return Boolean(user?.favoriteToolIds?.includes(toolId))
    },
    [user],
  )

  const addRecentTool = useCallback(
    (toolId: string) => {
      if (!user) return
      const current = user.recentToolIds ?? []
      const next = [toolId, ...current.filter((id) => id !== toolId)].slice(0, 10)
      const updated: User = { ...user, recentToolIds: next }
      setUser(updated)
      authService.setStoredUser(updated)
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      isLoading: loading,
      login,
      register,
      logout,
      updateProfile,
      toggleFavorite,
      isFavorite,
      addRecentTool,
      loginAsDemo,
      isAuthModalOpen,
      authModalView,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      toggleFavorite,
      isFavorite,
      addRecentTool,
      loginAsDemo,
      isAuthModalOpen,
      authModalView,
      openAuthModal,
      closeAuthModal,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
