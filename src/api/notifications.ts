import { apiClient } from "@/api/client"

export type Notification = {
  id: string
  message: string
  title?: string
  isRead: boolean
  createdAt: string
  bookingId?: string | null
  propertyId?: string | null
}

export async function getNotifications() {
  return apiClient.get<Notification[]>(
    "/api/notifications"
  )
}

export async function markNotificationRead(
  id: string
) {
  return apiClient.patch<Notification>(
    `/api/notifications/${id}/read`
  )
}

export async function markAllNotificationsRead() {
  return apiClient.patch(
    "/api/notifications/read-all"
  )
}