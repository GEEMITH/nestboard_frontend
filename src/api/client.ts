import type { ApiErrorResponse, AuthTokens } from "@/types/auth"

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined")
}

const ACCESS_TOKEN_KEY = "nestboard_access_token"
const REFRESH_TOKEN_KEY = "nestboard_refresh_token"

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

function loadAccessToken(): string | null {
  if (accessToken) return accessToken

  accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY)

  return accessToken
}

export function getAccessToken(): string | null {
  return loadAccessToken()
}

export function setTokens(tokens: AuthTokens): void {
  accessToken = tokens.accessToken

  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearTokens(): void {
  accessToken = null

  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorResponse | null = null

  try {
    body = (await response.json()) as ApiErrorResponse
  } catch {
    // Ignore invalid/non-JSON error responses.
  }

  return new ApiError(
    body?.error?.message ?? `Request failed with status ${response.status}`,
    response.status,
    body?.error?.code,
    body?.error?.details
  )
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearTokens()
      return null
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      })

      if (!response.ok) {
        clearTokens()
        return null
      }

      const tokens = (await response.json()) as AuthTokens

      setTokens(tokens)

      return tokens.accessToken
    } catch {
      clearTokens()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers)

  if (
  options.body &&
  !(options.body instanceof FormData) &&
  !headers.has("Content-Type")
) {
  headers.set("Content-Type", "application/json")
}

  const token = loadAccessToken()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retry) {
    const newAccessToken = await refreshAccessToken()

    if (newAccessToken) {
      return request<T>(path, options, false)
    }
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    })
  },

  postForm<T>(
    path: string,
    body: FormData,
  ): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body,
    })
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    })
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: "DELETE",
    })
  },
}