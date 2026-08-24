import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type PropertySectionProps = {
  image: string
  rating: number
}

export function PropertySection({ image, rating }: PropertySectionProps) {
  return (
    <section className="relative h-72 w-full overflow-hidden">
      <img src={image} alt="Property" className="h-full w-full object-cover" />
      <Badge className="absolute right-4 bottom-4 h-auto gap-1.5 border-0 bg-white/90 px-3 py-1.5 text-gray-800 backdrop-blur-sm">
        <Star className="size-4 fill-yellow-400 text-yellow-400" />
        <span className="font-bold">{rating}</span>
      </Badge>
    </section>
  )
}
