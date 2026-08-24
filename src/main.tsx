import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"

import "./index.css"

import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@/auth/AuthProvider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!googleClientId) {
  console.warn(
    "VITE_GOOGLE_CLIENT_ID is not configured"
  )
}

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={googleClientId || ""}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)