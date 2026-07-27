import {
  Search,
  SlidersHorizontal,
  Home,
  Building2,
  Warehouse,
  Hotel,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"
import { useUIStore } from "@/stores/uiStore"

// type SearchFiltersProps = {
//   // searchQuery: string
//   activeCategory: Property["type"] | "All"
//   //readonly onSearchChange: (value: string) => void
//   onCategoryChange: (value: Property["type"] | "All") => void
// }

interface Category {
  label: Property["type"] | "All"
  icon: LucideIcon | null
}

const categories: Category[] = [
  { label: "All", icon: null },
  { label: "House", icon: Home },
  { label: "Villa", icon: Warehouse },
  { label: "Apartment", icon: Building2 },
  { label: "Hotel", icon: Hotel },
]

// export function SearchFilters({
//   //searchQuery,
//   //activeCategory,
//   //onSearchChange,
//   //onCategoryChange,
// }: SearchFiltersProps)

export function SearchFilters() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  const activeCategory = useUIStore((state) => state.activeCategory)
  const setActiveCategory = useUIStore((state) => state.setActiveCategory)
  return (
    <div className="relative z-20 -mt-7 px-4">
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        {/* Search row */}
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              placeholder="Search by property name or city..."
              className="h-10 rounded-xl border-gray-200 pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            className="h-10 gap-1.5 rounded-xl text-gray-600"
          >
            <SlidersHorizontal />
            Filters
          </Button>
        </div>
        {/* Category tabs */}
        <div className="flex items-center gap-1.5">
          {categories.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              size="sm"
              variant={activeCategory === label ? "default" : "outline"}
              className="gap-1.5 rounded-full"
              onClick={() => setActiveCategory(label)}
            >
              {Icon && <Icon />}
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
