import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { ApiError } from "@/api/client"
import { getCurrentUser, register } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"

function getSafeReturnTo(value: string | null): string {
  if (!value) return "/dashboard"

  try {
    const decoded = decodeURIComponent(value)

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/dashboard"
    }

    return decoded
  } catch {
    return "/dashboard"
  }
}

export function SignUp() {
  const navigate = useNavigate()
  const location = useLocation()

  const setUser = useAuthStore((state) => state.setUser)

  const searchParams = new URLSearchParams(location.search)
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"))

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await register({
        displayName,
        email,
        password,
      })

      const user = await getCurrentUser()

      setUser(user)

      navigate(returnTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError("Unable to create your account.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">
          Create your NestBoard account
        </h1>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Display name
            </label>

            <input
              id="displayName"
              required
              minLength={2}
              maxLength={80}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}