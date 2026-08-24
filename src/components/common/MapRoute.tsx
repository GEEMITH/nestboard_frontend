import { useQuery } from "@tanstack/react-query"
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet"
import { Link } from "react-router"

import "leaflet/dist/leaflet.css"

import { fetchProperties } from "@/api/properties"

export function MapRoute() {
  const propertiesQuery = useQuery({
    queryKey: ["map-properties"],
    queryFn: () =>
      fetchProperties({
        page: 1,
        limit: 100,
      }),
  })

  if (propertiesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        Loading map...
      </div>
    )
  }

  if (propertiesQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        Unable to load properties for the map.
      </div>
    )
  }

  const properties =
    propertiesQuery.data?.data ?? []

  // Only properties that have valid coordinates
  const validProperties = properties.filter(
    (property) =>
      typeof property.lat === "number" &&
      typeof property.lng === "number" &&
      Number.isFinite(property.lat) &&
      Number.isFinite(property.lng),
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Explore Properties
          </h1>

          <p className="mt-2 text-gray-500">
            Browse available properties by location.
          </p>
        </div>

        {validProperties.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold">
              No property locations available
            </h2>

            <p className="mt-2 text-gray-500">
              Properties need valid latitude and longitude
              coordinates to appear on the map.
            </p>
          </div>
        ) : (
          <div className="h-[70vh] overflow-hidden rounded-2xl border bg-white shadow-sm">
            <MapContainer
              center={[
                validProperties[0].lat!,
                validProperties[0].lng!,
              ]}
              zoom={11}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {validProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={[
                    property.lat!,
                    property.lng!,
                  ]}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <h3 className="font-bold">
                        {property.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {property.location}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {property.price}
                      </p>

                      <Link
                        to={`/property-details/${property.id}`}
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                      >
                        View Property
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}