import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type PropertyInfoProps = {
  title: string
  address: string
  amenities: string[]
  seatsAvailable: number
  minStay: string
  startingPrice: string
}

export function PropertyInfo({
  title,
  address,
  amenities,
  seatsAvailable,
  minStay,
  startingPrice,
}: PropertyInfoProps) {
  return (
    <Card className="relative z-10 gap-0 rounded-3xl p-6 shadow-xl ring-0">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="mt-1.5 flex items-center gap-1.5 text-gray-400">
        <MapPin className="size-3.5 shrink-0" />
        <span className="text-sm">{address}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {amenities.map((amenity) => (
          <Badge
            key={amenity}
            variant="outline"
            className="rounded-full px-3 py-1 text-xs font-medium text-gray-600"
          >
            {amenity}
          </Badge>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-gray-100">
        <div className="flex flex-col items-center py-2">
          <span className="text-2xl font-bold text-gray-900">
            {seatsAvailable}
          </span>
          <span className="mt-0.5 text-xs text-gray-400">Seats Available</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="text-2xl font-bold text-gray-900">{minStay}</span>
          <span className="mt-0.5 text-xs text-gray-400">Min. Stay</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <span className="text-2xl font-bold text-gray-900">
            {startingPrice}
          </span>
          <span className="mt-0.5 text-xs text-gray-400">From</span>
        </div>
      </div>
    </Card>
  )
}
