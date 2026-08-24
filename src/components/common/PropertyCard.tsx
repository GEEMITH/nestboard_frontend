import {
  Heart,
  Star,
} from "lucide-react"

import { Badge } from "../ui/badge"
import { Card } from "../ui/card"

import type { Property } from "@/types/property"
import {
  Link,
  useNavigate,
} from "react-router"

import { useAuthStore } from "@/stores/authStore"
import { useToggleFavorite } from "@/hooks/useFavorites"

export function PropertyCard(
  props: Property,
) {
  const navigate = useNavigate()

  const user = useAuthStore(
    (state) => state.user,
  )

  const toggleFavorite =
    useToggleFavorite()

  const isFavorite =
    props.isFavorite ?? false

  function handleFavorite(
    event: React.MouseEvent,
  ) {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate("/sign-in")
      return
    }

    toggleFavorite.mutate(props.id)
  }

  return (
    <Link
      to={`/property-details/${props.id}`}
      className="block"
    >
      <Card
        className="relative cursor-pointer rounded-2xl p-0 ring-0"
        style={{
          aspectRatio: "1/1",
        }}
      >
        <img
          src={props.image}
          alt={props.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

        <button
          type="button"
          onClick={handleFavorite}
          disabled={toggleFavorite.isPending}
          className="absolute top-2.5 left-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <Heart
            className={
              isFavorite
                ? "h-5 w-5 fill-red-500 text-red-500"
                : "h-5 w-5 text-gray-700"
            }
          />
        </button>

        <Badge className="absolute top-2.5 right-2.5 h-auto gap-1 border-0 bg-white/90 py-0.5 text-gray-800 backdrop-blur-sm">
          <Star className="size-3 fill-yellow-400 text-yellow-400" />

          {props.rating}
        </Badge>

        <div className="absolute right-0 bottom-0 left-0 p-3">
          <Badge
            variant="secondary"
            className="mb-1.5 h-auto border-0 bg-white/25 text-[9px] tracking-wider text-white uppercase backdrop-blur-sm hover:bg-white/25"
          >
            {props.type}
          </Badge>

          <h3 className="text-sm leading-snug font-bold text-white">
            {props.title}
          </h3>

          <p className="mb-1.5 text-[11px] text-white/65">
            {props.location}
          </p>

          <p className="text-sm text-white">
            <span className="font-bold">
              {props.price}
            </span>

            <span className="text-[11px] text-white/60">
              {" "}
              /Month
            </span>
          </p>
        </div>
      </Card>
    </Link>
  )
}