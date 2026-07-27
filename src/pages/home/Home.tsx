//import { useState } from "react"
import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"
import type { Property } from "@/types/property"
import { useProperties } from "@/hooks/useProperties"
import { useUIStore } from "@/stores/uiStore"

export function Home() {
  // const [searchQuery, setSearchQuery] = useState("")
  // const [activeCategory, setActiveCategory] = useState<
  //   Property["type"] | "All"
  // >("All")
  const searchQuery = useUIStore((state) => state.searchQuery)
  const activeCategory = useUIStore((state) => state.activeCategory)
  const { data: properties = [], isLoading, isError } = useProperties()
  const filterBySearch = (property: Property) => {
    return (
      searchQuery === "" ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filterByCategory = (property: Property) => {
    return activeCategory === "All" || property.type === activeCategory
  }

  const filteredProperties = properties.filter(
    (property) => filterBySearch(property) && filterByCategory(property)
  )

  return (
    <>
      <HeroSection />
      <SearchFilters />

      {/* <SearchFilters
        searchQuery={searchQuery}
        activeCategory={activeCategory}
        onSearchChange={setSearchQuery}
        onCategoryChange={setActiveCategory}
      /> */}
      {isError && (
        <div className="px-8 py-10 text-red-400">
          Failed to load properties. Please try again.
        </div>
      )}
      {!isLoading && !isError && (
        <PropertyList properties={filteredProperties} />
      )}
    </>
  )
}
