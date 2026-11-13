const API_BASE = '/api/auth'

export type Student = {
  id: number
  first_name: string
  last_name: string
  email: string
}

export type RegisterData = {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
}

export type LoginData = {
  email: string
  password: string
}

export class ApiError extends Error {
  status: number
  details: Record<string, unknown>

  constructor(status: number, details: Record<string, unknown>) {
    const message =
      Object.values(details).flat().filter(
        (value): value is string => typeof value === 'string'
      ).join(' ') || 'Something went wrong. Please try again.'

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let details: Record<string, unknown> = {}

    try {
      const data: unknown = await response.json()
      if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
        details = data as Record<string, unknown>
      }
    } catch {
      details = { detail: `Request failed (${response.status}).` }
    }

    throw new ApiError(response.status, details)
  }

  return response.json() as Promise<T>
}

async function csrfToken(): Promise<string> {
  await request<{ detail: string }>('/csrf/')

  const token = getCookie('csrftoken')

  if (!token) {
    throw new Error('Unable to initialize secure authentication.')
  }

  return token
}

async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const token = await csrfToken()

  return request<T>(endpoint, {
    method: 'POST',
    headers: {
      'X-CSRFToken': token,
    },
    body: JSON.stringify(data ?? {}),
  })
}

export const authApi = {
  register: (data: RegisterData) =>
    post<Student>('/register/', data),

  login: (data: LoginData) =>
    post<Student>('/login/', data),

  logout: () =>
    post<{ detail: string }>('/logout/'),

  me: () =>
    request<Student>('/me/'),
}
