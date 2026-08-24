import { apiClient } from "@/api/client"
import type {
  Property,
  PropertyDetail,
  Room,
} from "@/types/property"

export type PropertyFilters = {
  page?: number
  limit?: number
  search?: string
  type?: "HOUSE" | "VILLA" | "APARTMENT" | "HOTEL"
  city?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: "recency" | "price_asc" | "price_desc" | "rating_desc"
}

export type PropertyListResponse = {
  data: Property[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

type ApiPropertyDetail = {
  id: string
  vendorId: string
  title: string
  description: string
  address: string
  city: string
  type: "HOUSE" | "VILLA" | "APARTMENT" | "HOTEL"
  rating: string
  isFavorite: boolean
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay: string
  cost: string
  available_seats: number
}

type ApiRoomType = {
  id: string
  name: string
  pricePerMonth: string
  freeSeats: number
  maxSeatsCount: number
  roomsCount: number
  seatCapacity: number
  hasAC: boolean
}

export type RoomTypeDetail = {
  id: string
  name: string
  pricePerMonth: string
  maxSeatsCount: number
  roomsCount: number
  hasAC: boolean
  rooms: {
    roomId: string
    roomName: string
    booking: {
      seatIndex: number
      tenant: string
      tenantBio: string
    }[]
  }[]
}

function createQueryString(filters: PropertyFilters) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      params.set(key, String(value))
    }
  })

  return params.toString()
}

export async function fetchProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListResponse> {
  const queryString = createQueryString(filters)

  return apiClient.get<PropertyListResponse>(
    `/api/properties${queryString ? `?${queryString}` : ""}`,
  )
}

export async function fetchFavoriteProperties(): Promise<Property[]> {
  return apiClient.get<Property[]>(
    "/api/properties/my-favorites",
  )
}

export async function toggleFavorite(
  propertyId: string,
): Promise<{
  propertyId: string
  isFavorite: boolean
}> {
  return apiClient.patch(
    `/api/properties/${propertyId}/toggle-favorite`,
  )
}

export async function fetchPropertyDetail(
  id: string,
): Promise<PropertyDetail> {
  const [property, roomTypes] = await Promise.all([
    apiClient.get<ApiPropertyDetail>(
      `/api/properties/${id}`,
    ),

    apiClient.get<ApiRoomType[]>(
      `/api/properties/${id}/room-types`,
    ),
  ])

  const rooms: Room[] = roomTypes.map(
    (roomType) => ({
      id: roomType.id,
      name: roomType.name,
      price: roomType.pricePerMonth,
      seatsTotal: roomType.seatCapacity,
      seatsFree: roomType.freeSeats,
      hasAC: roomType.hasAC,
    }),
  )

  return {
    id: property.id,
    title: property.title,
    address: property.address,
    city: property.city,
    description: property.description,
    amenities: property.amenities,
    rating: Number(property.rating),
    seatsAvailable: property.available_seats,
    minStay: property.minStay,
    startingPrice: property.cost,
    image: property.imageUrl,
    latitude: property.latitude,
    longitude: property.longitude,
    isFavorite: property.isFavorite,
    rooms,
  }
}

export async function fetchRoomTypeDetail(
  propertyId: string,
  roomTypeId: string,
  startMonth: string,
  durationMonths: number,
): Promise<RoomTypeDetail> {
  const params = new URLSearchParams({
    startMonth,
    durationMonths: String(durationMonths),
  })

  return apiClient.get<RoomTypeDetail>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}?${params.toString()}`,
  )
}