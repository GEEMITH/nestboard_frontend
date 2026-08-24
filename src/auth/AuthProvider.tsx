import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/stores/authStore"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return <>{children}</>
}