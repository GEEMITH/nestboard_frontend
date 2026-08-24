import { useUser } from "@clerk/react"
import { type ReactNode, useEffect } from "react"

const ADMIN_CLASS = "admin-theme"

type AdminThemeApplierProps = {
  children: ReactNode
}

export function AdminThemeApplier({ children }: AdminThemeApplierProps) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    const role = (user?.publicMetadata as { role?: string } | undefined)?.role
    const root = document.documentElement

    if (role === "admin") {
      root.classList.add(ADMIN_CLASS)
    } else {
      root.classList.remove(ADMIN_CLASS)
    }

    return () => {
      root.classList.remove(ADMIN_CLASS)
    }
  }, [user, isLoaded])

  return <>{children}</>
}
