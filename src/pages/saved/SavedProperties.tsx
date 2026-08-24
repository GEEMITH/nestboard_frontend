import { PropertyCard } from "@/components/common/PropertyCard"
import { useFavoriteProperties } from "@/hooks/useFavorites"

export function SavedProperties() {
  const {
    data: properties = [],
    isLoading,
    isError,
    error,
  } = useFavoriteProperties()

  if (isLoading) {
    return (
      <div className="px-8 py-32 text-center text-gray-500">
        Loading saved properties...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-8 py-32 text-center text-red-500">
        {error instanceof Error
          ? error.message
          : "Failed to load saved properties."}
      </div>
    )
  }

  return (
    <section className="px-8 pt-32 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Saved Properties
        </h1>

        <p className="mt-1 text-gray-500">
          Your favourite places in one place.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="text-xl font-semibold">
            No saved properties yet
          </h2>

          <p className="mt-2 text-gray-500">
            Save properties you like to find them here later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>
      )}
    </section>
  )
}