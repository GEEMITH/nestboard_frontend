import { Navigate } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // ADMIN users should never see the tenant dashboard.
  if (user?.role === "ADMIN") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome, {user?.displayName ?? "User"}!
        </h1>

        <p className="mt-2 text-gray-600">
          This is your tenant dashboard.
        </p>
      </div>
    </div>
  )
}