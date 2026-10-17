import { api, ApiError } from './api'

export interface User {
  id: number
  name: string
  email: string
  created_at?: string
  favoriteToolIds?: string[]
  recentToolIds?: string[]
  [key: string]: any
}

export interface AuthSuccessResponse {
  status: 'success'
  message?: string
  token: string
  user: User
}

export interface AuthErrorResponse {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const FALLBACK_TOKEN_KEY = 'vimz_auth_token'
const FALLBACK_USER_KEY = 'vimz_user_data'

class AuthService {
  /**
   * Get current auth token from storage
   */
  getToken(): string | null {
    try {
      return (
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(FALLBACK_TOKEN_KEY) ||
        null
      )
    } catch {
      return null
    }
  }

  /**
   * Save auth token to storage
   */
  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem(FALLBACK_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(FALLBACK_TOKEN_KEY)
      }
    } catch {
      /* ignore storage quota/security error */
    }
  }

  /**
   * Remove auth token
   */
  removeToken(): void {
    this.setToken(null)
  }

  /**
   * Get cached user from storage
   */
  getStoredUser(): User | null {
    try {
      const raw =
        localStorage.getItem(USER_KEY) ||
        localStorage.getItem(FALLBACK_USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  /**
   * Save user to storage
   */
  setStoredUser(user: User | null): void {
    try {
      if (user) {
        const str = JSON.stringify(user)
        localStorage.setItem(USER_KEY, str)
        localStorage.setItem(FALLBACK_USER_KEY, str)
      } else {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(FALLBACK_USER_KEY)
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Register a new user
   */
  async register(data: {
    name: string
    email: string
    password: string
    password_confirmation?: string
  }): Promise<{ user: User; token: string }> {
    try {
      const res = await api.post<AuthSuccessResponse>('register', data)
      if (res && res.token && res.user) {
        this.setToken(res.token)
        this.setStoredUser(res.user)
        return { user: res.user, token: res.token }
      }
      throw new Error(res?.message || 'Failed to register.')
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new Error(err?.message || 'Could not register user.')
    }
  }

  /**
   * Log in with email and password
   */
  async login(credentials: {
    email: string
    password: string
  }): Promise<{ user: User; token: string }> {
    try {
      const res = await api.post<AuthSuccessResponse>('login', credentials)
      if (res && res.token && res.user) {
        this.setToken(res.token)
        this.setStoredUser(res.user)
        return { user: res.user, token: res.token }
      }
      throw new Error(res?.message || 'Invalid credentials.')
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new Error(err?.message || 'Could not log in.')
    }
  }

  /**
   * Log out authenticated user
   */
  async logout(): Promise<void> {
    const token = this.getToken()
    try {
      if (token) {
        await api.post('logout')
      }
    } catch {
      /* ignore network failures during logout */
    } finally {
      this.removeToken()
      this.setStoredUser(null)
    }
  }

  /**
   * Fetch currently authenticated user from Laravel Sanctum
   */
  async getUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      // First try /user, fallback to /me
      let res: any
      try {
        res = await api.get('user')
      } catch {
        res = await api.get('me')
      }

      const userData: User = res?.user || res
      if (userData && userData.email) {
        this.setStoredUser(userData)
        return userData
      }
      return null
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        // Token expired/invalid
        this.removeToken()
        this.setStoredUser(null)
      }
      return null
    }
  }

  /**
   * Update profile details
   */
  async updateProfile(params: {
    name?: string
    email?: string
    password?: string
  }): Promise<User> {
    const res = await api.post<{ status: string; user: User }>('profile', params)
    if (res?.user) {
      this.setStoredUser(res.user)
      return res.user
    }
    throw new Error('Failed to update profile.')
  }

  /**
   * Toggle favorite tool ID in Laravel MySQL backend
   */
  async toggleFavorite(
    toolId: string,
  ): Promise<{ isFavorite: boolean; favoriteToolIds: string[] }> {
    const res = await api.post<{
      status: string
      is_favorite: boolean
      favoriteToolIds: string[]
    }>('favorites/toggle', { tool_id: toolId })
    return {
      isFavorite: Boolean(res?.is_favorite),
      favoriteToolIds: res?.favoriteToolIds || [],
    }
  }

  /**
   * Get user favorite tool IDs
   */
  async getFavorites(): Promise<string[]> {
    try {
      const res = await api.get<{
        status: string
        favoriteToolIds: string[]
      }>('favorites')
      return res?.favoriteToolIds || []
    } catch {
      return []
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ status: string; message: string }>('forgot-password', { email })
    return { message: res?.message || 'Password reset link sent.' }
  }

  /**
   * Reset password
   */
  async resetPassword(data: {
    email: string
    password: string
    token?: string
    password_confirmation?: string
  }): Promise<{ message: string }> {
    const res = await api.post<{ status: string; message: string }>('reset-password', data)
    return { message: res?.message || 'Password updated.' }
  }
}

export const authService = new AuthService()
export default authService
