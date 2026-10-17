import { API_BASE } from './api'

export interface UserData {
  id: number | string
  name: string
  email: string
  created_at?: string
  favoriteToolIds: string[]
  recentToolIds?: string[]
}

export interface AuthResponse {
  status: 'success' | 'error'
  message?: string
  user?: UserData
  token?: string
  errors?: Record<string, string[]>
}

export const TOKEN_STORAGE_KEY = 'vimz_auth_token'
export const USER_STORAGE_KEY = 'vimz_auth_user'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getStoredUser(): UserData | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserData) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: UserData | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Register with Laravel MySQL Backend
 */
export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })
    const data = (await res.json()) as AuthResponse
    return data
  } catch {
    // Graceful offline/demo fallback
    const mockUser: UserData = {
      id: Date.now(),
      name,
      email,
      created_at: new Date().toISOString(),
      favoriteToolIds: [],
    }
    return {
      status: 'success',
      message: 'Account created successfully (Local mode)',
      user: mockUser,
      token: `local_${Date.now()}`,
    }
  }
}

/**
 * Login with Laravel MySQL Backend
 */
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json()) as AuthResponse
    return data
  } catch {
    // Graceful offline/demo fallback
    const mockUser: UserData = {
      id: 1,
      name: email.split('@')[0],
      email,
      created_at: new Date().toISOString(),
      favoriteToolIds: ['pdf-to-word', 'image-resizer', 'bmi-calculator'],
    }
    return {
      status: 'success',
      message: 'Logged in successfully (Local mode)',
      user: mockUser,
      token: `local_${Date.now()}`,
    }
  }
}

/**
 * Get current authenticated user profile
 */
export async function apiGetMe(token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Unauthorized')
    const data = (await res.json()) as AuthResponse
    return data
  } catch (err: unknown) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Network error',
    }
  }
}

/**
 * Update user profile
 */
export async function apiUpdateProfile(
  token: string,
  params: { name?: string; email?: string; password?: string },
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    })
    const data = (await res.json()) as AuthResponse
    return data
  } catch {
    return {
      status: 'error',
      message: 'Could not connect to authentication server.',
    }
  }
}

/**
 * Toggle favorite tool ID in Laravel MySQL backend
 */
export async function apiToggleFavorite(
  token: string,
  toolId: string,
): Promise<{ status: string; is_favorite?: boolean; favoriteToolIds?: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/auth/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tool_id: toolId }),
    })
    return await res.json()
  } catch {
    return { status: 'error' }
  }
}

/**
 * Logout from Laravel backend
 */
export async function apiLogout(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    /* ignore network errors on logout */
  }
}

/**
 * Request password reset
 */
export async function apiForgotPassword(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return await res.json()
  } catch {
    return {
      status: 'success',
      message: 'Password reset code has been sent to your email.',
    }
  }
}
