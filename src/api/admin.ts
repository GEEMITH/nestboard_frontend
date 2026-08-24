import { apiClient } from "@/api/client"

export type AdminProperty = {
  id: string
  vendorId: string
  title: string
  description: string
  address: string
  city: string
  type: "HOUSE" | "VILLA" | "APARTMENT" | "HOTEL"
  rating: string | number
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay: string
  isActive: boolean
  roomTypes?: AdminRoomType[]
}

export type AdminRoomType = {
  id: string
  propertyId: string
  name: string
  pricePerMonth: string | number
  seatCapacity: number
  hasAC: boolean
  isAvailable: boolean
  rooms?: AdminRoom[]
}

export type AdminRoom = {
  id: string
  roomTypeId: string
  roomLabel: string
  isAvailable: boolean
}

export type CreatePropertyInput = {
  title: string
  description: string
  address: string
  city: string
  type: AdminProperty["type"]
  amenities: string[]
  latitude: number
  longitude: number
  imageUrl: string
  minStay: string
  isActive?: boolean
}

export type UpdatePropertyInput =
  Partial<CreatePropertyInput>

export type CreateRoomTypeInput = {
  name: string
  pricePerMonth: number
  seatCapacity: number
  hasAC: boolean
  isAvailable: boolean
}

export type UpdateRoomTypeInput =
  Partial<CreateRoomTypeInput>

export type CreateRoomInput = {
  roomLabel: string
  isAvailable: boolean
}

export type UpdateRoomInput =
  Partial<CreateRoomInput>

export type AdminBooking = {
  id: string
  seatNumber: number
  leaseStart: string
  leaseEnd: string
  durationMonths: number
  totalAmount: string | number
  status: string
  paymentStatus: string
  createdAt: string
  tenant: {
    id: string
    displayName: string
    email: string
    avatarUrl?: string | null
  }
  room: {
    id: string
    roomLabel: string
    roomType: {
      id: string
      name: string
      property: {
        id: string
        title: string
        city: string
        address: string
        imageUrl: string
        vendorId: string
      }
    }
  }
}

export async function fetchAdminProperties() {
  return apiClient.get<AdminProperty[]>(
    "/api/properties/mine",
  )
}

export async function createProperty(
  data: CreatePropertyInput,
) {
  return apiClient.post<AdminProperty>(
    "/api/properties",
    data,
  )
}

export async function updateProperty(
  propertyId: string,
  data: UpdatePropertyInput,
) {
  return apiClient.patch<AdminProperty>(
    `/api/properties/${propertyId}`,
    data,
  )
}

export async function deleteProperty(
  propertyId: string,
) {
  return apiClient.delete<void>(
    `/api/properties/${propertyId}`,
  )
}

type ApiRoomType = {
  id: string
  name: string
  pricePerMonth: string | number
  freeSeats?: number
  maxSeatsCount?: number
  roomsCount?: number
  seatCapacity?: number
  hasAC: boolean
  isAvailable?: boolean
}

export async function fetchRoomTypes(
  propertyId: string,
): Promise<AdminRoomType[]> {
  const data = await apiClient.get<ApiRoomType[]>(
    `/api/properties/${propertyId}/room-types`,
  )

  return data.map((roomType) => ({
    id: roomType.id,

    propertyId,

    name: roomType.name,

    pricePerMonth:
      roomType.pricePerMonth,

    seatCapacity:
      roomType.maxSeatsCount ??
      roomType.seatCapacity ??
      1,

    hasAC: roomType.hasAC,

    isAvailable:
      roomType.isAvailable ?? true,
  }))
}

export async function fetchRoomTypeDetail(
  propertyId: string,
  roomTypeId: string,
): Promise<{
  rooms: AdminRoom[]
}> {
  const data = await apiClient.get<{
    id: string
    rooms: {
      roomId: string
      roomName: string
    }[]
  }>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}`,
  )

  return {
    rooms: data.rooms.map((room) => ({
      id: room.roomId,

      roomTypeId,

      roomLabel: room.roomName,

      isAvailable: true,
    })),
  }
}

export async function createRoomType(
  propertyId: string,
  data: CreateRoomTypeInput,
) {
  return apiClient.post<AdminRoomType>(
    `/api/properties/${propertyId}/room-types`,
    data,
  )
}

export async function updateRoomType(
  propertyId: string,
  roomTypeId: string,
  data: UpdateRoomTypeInput,
) {
  return apiClient.patch<AdminRoomType>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}`,
    data,
  )
}

export async function deleteRoomType(
  propertyId: string,
  roomTypeId: string,
) {
  return apiClient.delete<void>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}`,
  )
}

export async function createRoom(
  propertyId: string,
  roomTypeId: string,
  data: CreateRoomInput,
) {
  return apiClient.post<AdminRoom>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}/rooms`,
    data,
  )
}

export async function updateRoom(
  propertyId: string,
  roomTypeId: string,
  roomId: string,
  data: UpdateRoomInput,
) {
  return apiClient.patch<AdminRoom>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}/rooms/${roomId}`,
    data,
  )
}

export async function deleteRoom(
  propertyId: string,
  roomTypeId: string,
  roomId: string,
) {
  return apiClient.delete<void>(
    `/api/properties/${propertyId}/room-types/${roomTypeId}/rooms/${roomId}`,
  )
}

export async function fetchAdminBookings() {
  return apiClient.get<AdminBooking[]>(
    "/api/bookings/admin",
  )
}

export async function uploadPropertyImage(
  file: File,
) {
  const formData = new FormData()

  formData.append("image", file)

  return apiClient.postForm<{ url: string }>(
    "/api/uploads/cover-image",
    formData,
  )
}

export function resolveImageUrl(
  imageUrl?: string | null,
) {
  if (!imageUrl) {
    return ""
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl
  }

  const apiUrl =
    (import.meta.env.VITE_API_URL as string)
      ?.replace(/\/$/, "") ?? ""

  const path =
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`

  return `${apiUrl}${path}`
}