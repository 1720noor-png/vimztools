const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://charming-vitality-production-dd02.up.railway.app/api'

export const getToken = () => {
  try {
    return localStorage.getItem('vimz_auth_token') || ''
  } catch {
    return ''
  }
}

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem('vimz_auth_token', token)
    else localStorage.removeItem('vimz_auth_token')
  } catch {
    // ignore
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`)
    }

    return data
  } catch (err) {
    console.warn(`[API error ${endpoint}]:`, err.message)
    throw err
  }
}

// Authentication API
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, password_confirmation) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation }) }),
  getUser: () => apiRequest('/auth/user'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

// Tools & Purchases API
export const toolsApi = {
  getTools: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/tools${query ? `?${query}` : ''}`)
  },
  getTool: (slug) => apiRequest(`/tools/${slug}`),
  recordUsage: (slug) => apiRequest(`/tools/${slug}/use`, { method: 'POST' }),
  purchaseOneTime: (tool_slug, payment_method = 'sandbox', guest_email = null) =>
    apiRequest('/checkout/purchase', {
      method: 'POST',
      body: JSON.stringify({ tool_slug, payment_method, guest_email }),
    }),
  verifyDownload: (token) => apiRequest(`/download/verify/${token}`),
  recordDownload: (token) => apiRequest(`/download/record/${token}`, { method: 'POST' }),
}

// User Dashboard API
export const userApi = {
  getPurchases: () => apiRequest('/user/purchases'),
  getFavorites: () => apiRequest('/user/favorites'),
  toggleFavorite: (tool_slug) => apiRequest('/user/favorites/toggle', { method: 'POST', body: JSON.stringify({ tool_slug }) }),
  getSavedResults: () => apiRequest('/user/saved-results'),
  saveResult: (tool_slug, title, payload) => apiRequest('/user/saved-results', { method: 'POST', body: JSON.stringify({ tool_slug, title, payload }) }),
  deleteResult: (id) => apiRequest(`/user/saved-results/${id}`, { method: 'DELETE' }),
}

// Admin API
export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  getUsers: (page = 1) => apiRequest(`/admin/users?page=${page}`),
  getTools: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiRequest(`/admin/tools${query ? `?${query}` : ''}`)
  },
  updateTool: (id, data) => apiRequest(`/admin/tools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPurchases: (page = 1) => apiRequest(`/admin/purchases?page=${page}`),
}
