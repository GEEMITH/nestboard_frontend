import {
  Heart,
  Building2,
  LogOut,
  CalendarCheck,
  Bell,
  User,
  LayoutDashboard,
} from "lucide-react"

import {
  NavLink,
  useNavigate,
} from "react-router"

import { useAuthStore } from "@/stores/authStore"

export type NavbarLink = {
  label: string
  to: string
}

type NavbarProps = {
  links: NavbarLink[]
}

export function Navbar({
  links,
}: NavbarProps) {
  const navigate = useNavigate()

  const user = useAuthStore(
    (state) => state.user,
  )

  const logout = useAuthStore(
    (state) => state.logout,
  )

  const isSignedIn = !!user
  const isAdmin = user?.role === "ADMIN"

  function handleLogout() {
    logout()

    navigate("/", {
      replace: true,
    })
  }

  return (
    <div className="absolute top-0 right-0 left-0 z-50 px-4 pt-4">
      <nav
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3 ${
          isAdmin
            ? "bg-blue-600/80"
            : "bg-orange-500/80"
        }`}
      >
        <NavLink to="/">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            <span className="text-lg tracking-wide text-white">
              NestBoard
            </span>
          </div>
        </NavLink>

        <div className="flex flex-wrap items-center gap-1">
          {links.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-white text-gray-900"
                    : "text-white hover:bg-white/20",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-white text-blue-700"
                    : "bg-blue-900/40 text-white hover:bg-blue-900/60",
                ].join(" ")
              }
            >
              <LayoutDashboard className="h-4 w-4" />

              Admin Dashboard
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              {!isAdmin && (
                <>
                  <NavLink
                    to="/bookings"
                    className="rounded-full p-2 text-white hover:bg-white/20"
                    title="My Bookings"
                  >
                    <CalendarCheck className="h-5 w-5" />
                  </NavLink>

                  <NavLink
                    to="/saved"
                    className="rounded-full p-2 text-white hover:bg-white/20"
                    title="Saved Properties"
                  >
                    <Heart className="h-5 w-5" />
                  </NavLink>
                </>
              )}

              <NavLink
                to="/notifications"
                className="rounded-full p-2 text-white hover:bg-white/20"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </NavLink>

              <NavLink
                to="/profile"
                className="rounded-full p-2 text-white hover:bg-white/20"
                title="My Profile"
              >
                <User className="h-5 w-5" />
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-2 text-white hover:bg-white/20"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                navigate("/sign-in")
              }
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}