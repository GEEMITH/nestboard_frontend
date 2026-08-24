import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { useNavigate } from "react-router"

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notifications"

export function Notifications() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      })
    },
  })

  const notifications =
    notificationsQuery.data ?? []

  function handleNotificationClick(
    notification: (typeof notifications)[number]
  ) {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id)
    }

    if (notification.propertyId) {
      navigate(
        `/property-details/${notification.propertyId}`
      )
    } else if (notification.bookingId) {
      navigate("/bookings")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-28 pb-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Notifications
            </h1>

            <p className="text-gray-500">
              Updates about your bookings.
            </p>
          </div>

          <button
            onClick={() =>
              markAllMutation.mutate()
            }
            disabled={
              markAllMutation.isPending ||
              notifications.length === 0
            }
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        {notificationsQuery.isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            Unable to load notifications.
          </div>
        )}

        {!notificationsQuery.isLoading &&
          notifications.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Bell className="mx-auto mb-4 h-10 w-10 text-gray-400" />

              <h2 className="text-lg font-semibold">
                No notifications yet
              </h2>

              <p className="mt-2 text-gray-500">
                Booking updates will appear here.
              </p>
            </div>
          )}

        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`w-full rounded-xl border p-4 text-left transition ${
                notification.isRead
                  ? "bg-white"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className="mt-1 h-5 w-5 shrink-0 text-primary" />

                <div className="flex-1">
                  <p className="font-semibold">
                    {notification.title ??
                      "NestBoard update"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                {!notification.isRead && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}