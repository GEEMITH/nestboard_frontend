import { create } from "zustand"
import { getCurrentUser, logout as apiLogout } from "@/api/auth"
import { getAccessToken } from "@/api/client"
import type { ApiUser } from "@/types/auth"

type AuthState = {
  user: ApiUser | null
  isLoading: boolean
  isInitialized: boolean

  initialize: () => Promise<void>
  setUser: (user: ApiUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    const token = getAccessToken()

    if (!token) {
      set({
        user: null,
        isLoading: false,
        isInitialized: true,
      })

      return
    }

    try {
      const user = await getCurrentUser()

      set({
        user,
        isLoading: false,
        isInitialized: true,
      })
    } catch {
      apiLogout()

      set({
        user: null,
        isLoading: false,
        isInitialized: true,
      })
    }
  },

  setUser: (user) => {
    set({ user })
  },

  logout: () => {
    apiLogout()

    set({
      user: null,
      isLoading: false,
      isInitialized: true,
    })
  },
}))