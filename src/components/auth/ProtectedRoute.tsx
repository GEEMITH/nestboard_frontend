import { Navigate, useLocation } from "react-router"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/authStore"

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    const returnTo =
      `${location.pathname}${location.search}${location.hash}`

    return (
      <Navigate
        to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    )
  }

  return <>{children}</>
}