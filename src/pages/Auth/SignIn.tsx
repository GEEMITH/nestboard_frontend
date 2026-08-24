import { useState } from "react"
import type { FormEvent } from "react"

import {
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google"

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router"

import { ApiError } from "@/api/client"

import {
  getCurrentUser,
  login,
  loginWithGoogle,
} from "@/api/auth"

import { useAuthStore } from "@/stores/authStore"

function getSafeReturnTo(
  value: string | null
): string {
  if (!value) return "/dashboard"

  try {
    const decoded = decodeURIComponent(value)

    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//")
    ) {
      return "/dashboard"
    }

    return decoded
  } catch {
    return "/dashboard"
  }
}

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()

  const setUser = useAuthStore(
    (state) => state.setUser
  )

  const searchParams = new URLSearchParams(
    location.search
  )

  const returnTo = getSafeReturnTo(
    searchParams.get("returnTo")
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] =
    useState(false)

  async function completeLogin() {
    const user = await getCurrentUser()

    setUser(user)

    navigate(returnTo, {
      replace: true,
    })
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await login({
        email,
        password,
      })

      await completeLogin()
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError(
          "Unable to sign in. Please try again."
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSuccess(
    credentialResponse: CredentialResponse
  ) {
    if (!credentialResponse.credential) {
      setError(
        "Google did not return an ID token."
      )

      return
    }

    setError("")
    setIsLoading(true)

    try {
      await loginWithGoogle({
        idToken: credentialResponse.credential,
      })

      await completeLogin()
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError(
          "Google sign-in failed. Please try again."
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">
          Sign in to NestBoard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Continue to your NestBoard account.
        </p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {isLoading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setError(
                "Google sign-in was cancelled or failed."
              )
            }
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Need an account?{" "}

          <Link
            to={`/sign-up?returnTo=${encodeURIComponent(
              returnTo
            )}`}
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}