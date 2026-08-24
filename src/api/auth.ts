import { apiClient, clearTokens, setTokens } from "@/api/client"
import type {
  ApiUser,
  AuthTokens,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
} from "@/types/auth"

export async function login(input: LoginInput): Promise<AuthTokens> {
  const tokens = await apiClient.post<AuthTokens>("/api/auth/login", input)

  setTokens(tokens)

  return tokens
}

export async function register(
  input: RegisterInput
): Promise<AuthTokens> {
  const tokens = await apiClient.post<AuthTokens>(
    "/api/auth/register",
    input
  )

  setTokens(tokens)

  return tokens
}

export async function loginWithGoogle(
  input: GoogleLoginInput
): Promise<AuthTokens> {
  const tokens = await apiClient.post<AuthTokens>(
    "/api/auth/google",
    input
  )

  setTokens(tokens)

  return tokens
}

export async function getCurrentUser(): Promise<ApiUser> {
  return apiClient.get<ApiUser>("/api/auth/me")
}

export async function updateProfile(
  input: Partial<Pick<ApiUser, "displayName" | "avatarUrl" | "bioTag">>
): Promise<ApiUser> {
  return apiClient.patch<ApiUser>("/api/auth/me", input)
}

export function logout(): void {
  clearTokens()
}