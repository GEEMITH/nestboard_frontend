import type {
  ApiErrorResponse,
  AuthTokens,
} from "@/types/auth"

/*
|--------------------------------------------------------------------------
| API URL
|--------------------------------------------------------------------------
|
| VITE_API_URL may accidentally contain a trailing slash:
|
| https://example.vercel.app/
|
| But our API paths already start with:
|
| /api/...
|
| Therefore we ALWAYS remove trailing slashes here.
|
*/

const API_URL = String(
  import.meta.env.VITE_API_URL ?? "",
).replace(/\/+$/, "")

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not defined",
  )
}

const ACCESS_TOKEN_KEY =
  "nestboard_access_token"

const REFRESH_TOKEN_KEY =
  "nestboard_refresh_token"

let accessToken: string | null = null

let refreshPromise:
  | Promise<string | null>
  | null = null

/*
|--------------------------------------------------------------------------
| API ERROR
|--------------------------------------------------------------------------
*/

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message)

    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

/*
|--------------------------------------------------------------------------
| ACCESS TOKEN
|--------------------------------------------------------------------------
*/

function loadAccessToken(): string | null {
  if (accessToken) {
    return accessToken
  }

  accessToken =
    sessionStorage.getItem(
      ACCESS_TOKEN_KEY,
    )

  return accessToken
}

export function getAccessToken():
  | string
  | null {
  return loadAccessToken()
}

/*
|--------------------------------------------------------------------------
| SET TOKENS
|--------------------------------------------------------------------------
*/

export function setTokens(
  tokens: AuthTokens,
): void {
  accessToken = tokens.accessToken

  sessionStorage.setItem(
    ACCESS_TOKEN_KEY,
    tokens.accessToken,
  )

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    tokens.refreshToken,
  )
}

/*
|--------------------------------------------------------------------------
| CLEAR TOKENS
|--------------------------------------------------------------------------
*/

export function clearTokens(): void {
  accessToken = null

  sessionStorage.removeItem(
    ACCESS_TOKEN_KEY,
  )

  localStorage.removeItem(
    REFRESH_TOKEN_KEY,
  )
}

/*
|--------------------------------------------------------------------------
| REFRESH TOKEN
|--------------------------------------------------------------------------
*/

function getRefreshToken():
  | string
  | null {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY,
  )
}

/*
|--------------------------------------------------------------------------
| PARSE API ERROR
|--------------------------------------------------------------------------
*/

async function parseError(
  response: Response,
): Promise<ApiError> {
  let body:
    | ApiErrorResponse
    | null = null

  try {
    body =
      (await response.json()) as ApiErrorResponse
  } catch {
    // Response was not JSON.
  }

  return new ApiError(
    body?.error?.message ??
      `Request failed with status ${response.status}`,
    response.status,
    body?.error?.code,
    body?.error?.details,
  )
}

/*
|--------------------------------------------------------------------------
| REFRESH ACCESS TOKEN
|--------------------------------------------------------------------------
*/

async function refreshAccessToken():
  Promise<string | null> {
  /*
  | Prevent multiple simultaneous refresh requests.
  */

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise =
    (async () => {
      const refreshToken =
        getRefreshToken()

      if (!refreshToken) {
        clearTokens()
        return null
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/refresh`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                refreshToken,
              }),
            },
          )

        if (!response.ok) {
          clearTokens()
          return null
        }

        const tokens =
          (await response.json()) as AuthTokens

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

/*
|--------------------------------------------------------------------------
| NORMALIZE API PATH
|--------------------------------------------------------------------------
|
| This also protects against accidentally passing:
|
| //api/properties
|
| from another API function.
|
*/

function normalizePath(
  path: string,
): string {
  if (!path) {
    return ""
  }

  return path.startsWith("/")
    ? path
    : `/${path}`
}

/*
|--------------------------------------------------------------------------
| REQUEST
|--------------------------------------------------------------------------
*/

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(
    options.headers,
  )

  /*
  | Set JSON content type automatically.
  |
  | Do NOT set it for FormData because the
  | browser must generate the multipart boundary.
  */

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    )
  }

  /*
  | Add access token when available.
  */

  const token =
    loadAccessToken()

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    )
  }

  /*
  | IMPORTANT:
  |
  | API_URL has trailing slashes removed.
  |
  | Example:
  |
  | API_URL:
  | https://backend.vercel.app
  |
  | path:
  | /api/properties
  |
  | final:
  | https://backend.vercel.app/api/properties
  |
  | NEVER:
  | https://backend.vercel.app//api/properties
  */

  const normalizedPath =
    normalizePath(path)

  const url =
    `${API_URL}${normalizedPath}`

  const response =
    await fetch(url, {
      ...options,
      headers,
    })

  /*
  |--------------------------------------------------------------------------
  | ACCESS TOKEN EXPIRED
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 401 &&
    retry
  ) {
    const newAccessToken =
      await refreshAccessToken()

    if (newAccessToken) {
      return request<T>(
        path,
        options,
        false,
      )
    }
  }

  /*
  |--------------------------------------------------------------------------
  | API ERROR
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    throw await parseError(
      response,
    )
  }

  /*
  |--------------------------------------------------------------------------
  | NO CONTENT
  |--------------------------------------------------------------------------
  */

  if (response.status === 204) {
    return undefined as T
  }

  /*
  |--------------------------------------------------------------------------
  | JSON RESPONSE
  |--------------------------------------------------------------------------
  */

  return (await response.json()) as T
}

/*
|--------------------------------------------------------------------------
| API CLIENT
|--------------------------------------------------------------------------
*/

export const apiClient = {
  get<T>(
    path: string,
  ): Promise<T> {
    return request<T>(path)
  },

  post<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: "POST",

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      },
    )
  },

  postForm<T>(
    path: string,
    body: FormData,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: "POST",
        body,
      },
    )
  },

  patch<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: "PATCH",

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      },
    )
  },

  put<T>(
    path: string,
    body?: unknown,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: "PUT",

        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      },
    )
  },

  delete<T>(
    path: string,
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: "DELETE",
      },
    )
  },
}