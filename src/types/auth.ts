export type UserRole = "USER" | "ADMIN"

export type ApiUser = {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatarUrl: string | null
  bioTag: string | null
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  displayName?: string
}

export type GoogleLoginInput = {
  idToken: string
}

export type ApiErrorResponse = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}