import { apiClient } from "@/api/client"

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"

export type CreateBookingInput = {
  roomId: string
  seatNumber: number
  startMonth: string
  durationMonths: number
}

export type Booking = {
  id: string
  tenantId: string
  roomId: string
  seatNumber: number
  leaseStart: string
  leaseEnd: string
  durationMonths: number
  totalAmount: string
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  createdAt: string
  room: {
    id: string
    roomLabel: string
    isAvailable: boolean
    roomType: {
      id: string
      name: string
      pricePerMonth: string
      seatCapacity: number
      hasAC: boolean
      property: {
        id: string
        title: string
        address: string
        city: string
        imageUrl: string
      }
    }
  }
}

export async function createPendingBooking(
  input: CreateBookingInput
): Promise<Booking> {
  return apiClient.post<Booking>("/api/bookings", input)
}

export async function confirmBooking(
  bookingId: string
): Promise<Booking> {
  return apiClient.post<Booking>(
    `/api/bookings/${bookingId}/confirm`
  )
}

export async function cancelBooking(
  bookingId: string
): Promise<Booking> {
  return apiClient.post<Booking>(
    `/api/bookings/${bookingId}/cancel`
  )
}

export async function fetchMyBookings(): Promise<Booking[]> {
  return apiClient.get<Booking[]>("/api/bookings/my")
}