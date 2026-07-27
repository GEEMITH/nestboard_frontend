import { useUser } from "@clerk/react"
import { Navigate } from "react-router"
import type { ReactNode } from "react"

type AdminProtectedRouteProps = {
  children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  const role = user?.publicMetadata?.role as string | undefined

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
