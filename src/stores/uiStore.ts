import { create } from "zustand"
import type { Property } from "@/types/property"

type UIState = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeCategory: Property["type"] | "All"
  setActiveCategory: (category: Property["type"] | "All") => void
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeCategory: "All",
  setActiveCategory: (category) => set({ activeCategory: category }),
}))
