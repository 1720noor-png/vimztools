/**
 * API client configured with baseURL: 'http://localhost:8000/api'
 * Supports automatic Sanctum Bearer token attachment, JSON handling,
 * request/response interceptors, and Laravel error parsing.
 */

export const API_BASE_URL = 'http://localhost:8000/api'

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  ok: boolean
}

export interface ApiErrorPayload {
  status?: string
  message?: string
  errors?: Record<string, string[]>
  [key: string]: any
}

export class ApiError extends Error {
  status: number
  statusText: string
  data: ApiErrorPayload
  errors?: Record<string, string[]>

  constructor(status: number, statusText: string, data: ApiErrorPayload) {
    const message = data?.message || `HTTP Error ${status}: ${statusText}`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
    this.errors = data?.errors
  }
}

type RequestInterceptor = (config: RequestInit & { url: string }) => Promise<RequestInit & { url: string }> | (RequestInit & { url: string })
type ResponseInterceptor = (response: Response) => Promise<Response> | Response

class ApiClient {
  public baseURL: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/$/, '')
  }

  get interceptors() {
    return {
      request: {
        use: (fn: RequestInterceptor) => {
          this.requestInterceptors.push(fn)
        },
      },
      response: {
        use: (fn: ResponseInterceptor) => {
          this.responseInterceptors.push(fn)
        },
      },
    }
  }

  private getAuthToken(): string | null {
    try {
      return (
        localStorage.getItem('auth_token') ||
        localStorage.getItem('vimz_auth_token') ||
        null
      )
    } catch {
      return null
    }
  }

  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}/${endpoint.replace(/^\//, '')}`

    let url = cleanEndpoint
    if (options.params) {
      const sp = new URLSearchParams()
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined) sp.append(k, String(v))
      }
      const qs = sp.toString()
      if (qs) url += (url.includes('?') ? '&' : '?') + qs
    }

    const headers = new Headers(options.headers || {})
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    const token = this.getAuthToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    let config: RequestInit & { url: string } = {
      ...options,
      url,
      headers,
    }

    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config)
    }

    let res: Response
    try {
      res = await fetch(config.url, config)
    } catch (networkErr: any) {
      throw new ApiError(0, 'Network Error', {
        status: 'error',
        message: 'Could not connect to the API server at ' + this.baseURL,
      })
    }

    for (const interceptor of this.responseInterceptors) {
      res = await interceptor(res)
    }

    let responseData: any = null
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        responseData = await res.json()
      } catch {
        responseData = null
      }
    } else {
      try {
        responseData = await res.text()
      } catch {
        responseData = null
      }
    }

    if (!res.ok) {
      throw new ApiError(res.status, res.statusText, responseData || {})
    }

    return responseData as T
  }

  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const headers = new Headers(options?.headers || {})
    let body: any = data

    if (data !== undefined && !(data instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      body = JSON.stringify(data)
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body,
    })
  }

  put<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    const headers = new Headers(options?.headers || {})
    let body: any = data

    if (data !== undefined && !(data instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      body = JSON.stringify(data)
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body,
    })
  }

  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient(API_BASE_URL)
export default api
