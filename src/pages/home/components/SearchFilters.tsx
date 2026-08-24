import {
  Search,
  Home,
  Building2,
  Warehouse,
  Hotel,
  type LucideIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "react-router"

type PropertyType =
  | "HOUSE"
  | "VILLA"
  | "APARTMENT"
  | "HOTEL"

interface Category {
  label: string
  value?: PropertyType
  icon: LucideIcon | null
}

const categories: Category[] = [
  {
    label: "All",
    icon: null,
  },

  {
    label: "House",
    value: "HOUSE",
    icon: Home,
  },

  {
    label: "Villa",
    value: "VILLA",
    icon: Warehouse,
  },

  {
    label: "Apartment",
    value: "APARTMENT",
    icon: Building2,
  },

  {
    label: "Hotel",
    value: "HOTEL",
    icon: Hotel,
  },
]

export function SearchFilters() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const search =
    searchParams.get("search") ?? ""

  const type =
    searchParams.get("type") ?? ""

  const city =
    searchParams.get("city") ?? ""

  const minPrice =
    searchParams.get("minPrice") ?? ""

  const maxPrice =
    searchParams.get("maxPrice") ?? ""

  const minRating =
    searchParams.get("minRating") ?? ""

  const sort =
    searchParams.get("sort") ?? "recency"

  function updateParam(
    key: string,
    value: string,
  ) {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    setSearchParams(next)
  }

  function clearFilters() {
    setSearchParams({})
  }

  return (
    <div className="relative z-20 -mt-7 px-4">
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              placeholder="Search by property name or city..."
              className="h-10 rounded-xl border-gray-200 pl-9"
              onChange={(event) =>
                updateParam(
                  "search",
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map(
            ({
              label,
              value,
              icon: Icon,
            }) => (
              <Button
                key={label}
                size="sm"
                variant={
                  value
                    ? type === value
                      ? "default"
                      : "outline"
                    : !type
                      ? "default"
                      : "outline"
                }
                className="gap-1.5 rounded-full"
                onClick={() =>
                  updateParam(
                    "type",
                    value ?? "",
                  )
                }
              >
                {Icon && <Icon />}

                {label}
              </Button>
            ),
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Input
            value={city}
            placeholder="City"
            onChange={(event) =>
              updateParam(
                "city",
                event.target.value,
              )
            }
          />

          <Input
            type="number"
            min="0"
            value={minPrice}
            placeholder="Min price"
            onChange={(event) =>
              updateParam(
                "minPrice",
                event.target.value,
              )
            }
          />

          <Input
            type="number"
            min="0"
            value={maxPrice}
            placeholder="Max price"
            onChange={(event) =>
              updateParam(
                "maxPrice",
                event.target.value,
              )
            }
          />

          <select
            value={minRating}
            className="h-10 rounded-md border border-input bg-background px-3"
            onChange={(event) =>
              updateParam(
                "minRating",
                event.target.value,
              )
            }
          >
            <option value="">
              Any rating
            </option>

            <option value="4">
              4+ Stars
            </option>

            <option value="3">
              3+ Stars
            </option>

            <option value="2">
              2+ Stars
            </option>
          </select>

          <select
            value={sort}
            className="h-10 rounded-md border border-input bg-background px-3"
            onChange={(event) =>
              updateParam(
                "sort",
                event.target.value,
              )
            }
          >
            <option value="recency">
              Newest
            </option>

            <option value="rating_desc">
              Highest rating
            </option>

            <option value="price_asc">
              Price low to high
            </option>

            <option value="price_desc">
              Price high to low
            </option>
          </select>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  )
}