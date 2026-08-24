import { BrowserRouter, Route, Routes, Outlet } from "react-router"
import { Home } from "./pages/home/Home"
import { PropertyDetails } from "./pages/property/PropertyDetails"
import { Navbar, type NavbarLink } from "./components/common/Navbar"
import { MapRoute } from "./components/common/MapRoute"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SignIn } from "./pages/Auth/SignIn"
import { Dashboard } from "./pages/dashboard/Dashboard"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute"
import { AdminThemeApplier } from "./components/auth/AdminThemeApplier"

const navLinks: NavbarLink[] = [
  { label: "Explore", to: "/" },
  { label: "Map View", to: "/map" },
  { label: "Dashboard", to: "/dashboard" },
]

function AppLayout() {
  return (
    <>
      <Navbar links={navLinks} />
      <Outlet />
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AdminThemeApplier>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/property-details/:id" element={<PropertyDetails />} />
            <Route path="/map" element={<MapRoute />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
          </Route>
          <Route path="/sign-in/*" element={<SignIn />} />
        </Routes>
        <ReactQueryDevtools initialIsOpen={false} />
      </AdminThemeApplier>
    </BrowserRouter>
  )
}
export default App
