import { useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "react-router"

import { HeroSection } from "./components/HeroSection"
import { PropertyList } from "./components/PropertyList"
import { SearchFilters } from "./components/SearchFilters"

import { useProperties } from "@/hooks/useProperties"

export function Home() {
  const [searchParams] = useSearchParams()

  const filters = useMemo(() => {
    const minPrice =
      searchParams.get("minPrice")

    const maxPrice =
      searchParams.get("maxPrice")

    const minRating =
      searchParams.get("minRating")

    return {
      limit: 9,

      search:
        searchParams.get("search") || undefined,

      type:
        (searchParams.get("type") ||
          undefined) as
          | "HOUSE"
          | "VILLA"
          | "APARTMENT"
          | "HOTEL"
          | undefined,

      city:
        searchParams.get("city") || undefined,

      minPrice: minPrice
        ? Number(minPrice)
        : undefined,

      maxPrice: maxPrice
        ? Number(maxPrice)
        : undefined,

      minRating: minRating
        ? Number(minRating)
        : undefined,

      sort:
        (searchParams.get("sort") ||
          "recency") as
          | "recency"
          | "price_asc"
          | "price_desc"
          | "rating_desc",
    }
  }, [searchParams])

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProperties(filters)

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null)

  const properties =
    data?.pages.flatMap(
      (page) => page.data,
    ) ?? []

  const total =
    data?.pages[0]?.meta.total ?? 0

  useEffect(() => {
    const target = loadMoreRef.current

    if (!target || !hasNextPage) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
            !isFetchingNextPage
          ) {
            fetchNextPage()
          }
        },
        {
          rootMargin: "300px",
        },
      )

    observer.observe(target)

    return () => observer.disconnect()
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ])

  return (
    <>
      <HeroSection />

      <SearchFilters />

      {isLoading && (
        <div className="px-8 py-10 text-gray-500">
          Loading properties...
        </div>
      )}

      {isError && (
        <div className="px-8 py-10 text-red-500">
          {error instanceof Error
            ? error.message
            : "Failed to load properties."}
        </div>
      )}

      {!isLoading &&
        !isError &&
        properties.length === 0 && (
          <div className="px-8 py-16 text-center">
            <h2 className="text-2xl font-bold">
              No properties found
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        )}

      {!isLoading &&
        !isError &&
        properties.length > 0 && (
          <>
            <PropertyList
              properties={properties}
              total={total}
            />

            <div
              ref={loadMoreRef}
              className="flex justify-center px-8 py-10"
            >
              {isFetchingNextPage && (
                <p className="text-gray-500">
                  Loading more properties...
                </p>
              )}

              {!hasNextPage &&
                !isFetchingNextPage && (
                  <p className="text-gray-400">
                    You have reached the end.
                  </p>
                )}
            </div>
          </>
        )}
    </>
  )
}