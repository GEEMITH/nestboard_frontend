import { type ReactNode, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"

const ADMIN_CLASS = "admin-theme"

type AdminThemeApplierProps = {
  children: ReactNode
}

export function AdminThemeApplier({
  children,
}: AdminThemeApplierProps) {
  const role = useAuthStore((state) => state.user?.role)

  useEffect(() => {
    const root = document.documentElement

    if (role === "ADMIN") {
      root.classList.add(ADMIN_CLASS)
    } else {
      root.classList.remove(ADMIN_CLASS)
    }

    return () => {
      root.classList.remove(ADMIN_CLASS)
    }
  }, [role])

  return <>{children}</>
}