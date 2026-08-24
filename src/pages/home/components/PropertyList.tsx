import { PropertyCard } from "@/components/common/PropertyCard"
import type { Property } from "@/types/property"

interface PropertyListProps {
  properties: Property[]
  total: number
}

export function PropertyList({
  properties,
  total,
}: PropertyListProps) {
  return (
    <section className="mt-6 px-8 pb-10">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Property Listings
        </h2>

        <p className="text-md mt-0.5 text-gray-500">
          {total} properties found
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            {...property}
          />
        ))}
      </div>
    </section>
  )
}