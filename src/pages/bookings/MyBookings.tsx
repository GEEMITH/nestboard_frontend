import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  XCircle,
} from "lucide-react"

import {
  Link,
} from "react-router"

import {
  Button,
} from "@/components/ui/button"

import {
  useMyBookings,
  useConfirmBooking,
  useCancelBooking,
} from "@/hooks/useBookings"

import type {
  BookingStatus,
} from "@/api/bookings"

import {
  ApiError,
} from "@/api/client"

import {
  useEffect,
  useState,
} from "react"

function statusClasses(
  status: BookingStatus
) {
  switch (status) {
    case "CONFIRMED":
      return "border-green-200 bg-green-50 text-green-700"

    case "PENDING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700"

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700"

    case "EXPIRED":
      return "border-gray-200 bg-gray-100 text-gray-600"

    default:
      return "border-gray-200 bg-gray-100 text-gray-600"
  }
}

function StatusIcon({
  status,
}: {
  status: BookingStatus
}) {
  if (
    status === "CONFIRMED"
  ) {
    return (
      <CheckCircle2 className="size-4" />
    )
  }

  if (
    status === "PENDING"
  ) {
    return (
      <Clock3 className="size-4" />
    )
  }

  return (
    <XCircle className="size-4" />
  )
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(value))
}

function PendingTimer({
  createdAt,
}: {
  createdAt: string
}) {
  const HOLD_MS =
    60 * 1000

  const [
    remaining,
    setRemaining,
  ] = useState(
    Math.max(
      0,
      HOLD_MS -
        (Date.now() -
          new Date(
            createdAt
          ).getTime())
    )
  )

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setRemaining(
            Math.max(
              0,
              HOLD_MS -
                (Date.now() -
                  new Date(
                    createdAt
                  ).getTime())
            )
          )
        },
        1000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [createdAt])

  const minutes =
    Math.floor(
      remaining / 60000
    )

  const seconds =
    Math.floor(
      (remaining % 60000) /
        1000
    )

  const expired =
    remaining <= 0

  return (
    <div
      className={[
        "rounded-xl border p-4",
        expired
          ? "border-red-200 bg-red-50"
          : "border-orange-200 bg-orange-50",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Payment hold
      </p>

      <p
        className={[
          "mt-1 text-2xl font-bold tabular-nums",
          expired
            ? "text-red-600"
            : "text-orange-600",
        ].join(" ")}
      >
        {expired
          ? "00:00"
          : `${String(
              minutes
            ).padStart(2, "0")}:${String(
              seconds
            ).padStart(2, "0")}`}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {expired
          ? "Payment window expired."
          : "Confirm before the hold expires."}
      </p>
    </div>
  )
}

export function MyBookings() {
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useMyBookings()

  const confirmMutation =
    useConfirmBooking()

  const cancelMutation =
    useCancelBooking()

  const [
    error,
    setError,
  ] = useState("")

  function handleConfirm(
    id: string
  ) {
    setError("")

    confirmMutation.mutate(
      id,
      {
        onError: (
          err
        ) => {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to confirm this booking."
          )
        },
      }
    )
  }

  function handleCancel(
    id: string
  ) {
    setError("")

    cancelMutation.mutate(
      id,
      {
        onError: (
          err
        ) => {
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to cancel this booking."
          )
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Bookings
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your NestBoard reservations.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto size-6 animate-spin text-orange-500" />

            <p className="mt-3 text-gray-500">
              Loading bookings...
            </p>
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">
              Could not load your bookings.
            </p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() =>
                void refetch()
              }
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          bookings.length === 0 && (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <Home className="mx-auto size-10 text-gray-300" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No bookings yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Explore properties and reserve your first seat.
              </p>

              <Button
                asChild
                className="mt-5"
              >
                <Link to="/">
                  Explore properties
                </Link>
              </Button>
            </div>
          )}

        <div className="mt-8 space-y-5">
          {bookings.map(
            (booking) => {
              const property =
                booking.room
                  .roomType
                  .property

              const price =
                Number(
                  booking.totalAmount
                )

              return (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={
                        property.imageUrl
                      }
                      alt={
                        property.title
                      }
                      className="h-52 w-full object-cover md:h-auto md:w-56"
                    />

                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {
                              property.title
                            }
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              property.address
                            }
                            ,{" "}
                            {
                              property.city
                            }
                          </p>
                        </div>

                        <span
                          className={[
                            "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                            statusClasses(
                              booking.bookingStatus
                            ),
                          ].join(
                            " "
                          )}
                        >
                          <StatusIcon
                            status={
                              booking.bookingStatus
                            }
                          />

                          {
                            booking.bookingStatus
                          }
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Info
                          label="Room"
                          value={
                            booking.room.roomLabel
                          }
                        />

                        <Info
                          label="Room type"
                          value={
                            booking.room
                              .roomType
                              .name
                          }
                        />

                        <Info
                          label="Seat"
                          value={`Seat ${booking.seatNumber}`}
                        />

                        <Info
                          label="Total"
                          value={
                            Number.isFinite(
                              price
                            )
                              ? `LKR ${price.toLocaleString()}`
                              : booking.totalAmount
                          }
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4 text-sm text-gray-500">
                        <CalendarDays className="size-4" />

                        <span>
                          {formatDate(
                            booking.leaseStart
                          )}{" "}
                          –{" "}
                          {formatDate(
                            booking.leaseEnd
                          )}
                        </span>
                      </div>

                      {booking.bookingStatus ===
                        "PENDING" && (
                        <div className="mt-5 space-y-4">
                          <PendingTimer
                            createdAt={
                              booking.createdAt
                            }
                          />

                          <div className="flex flex-wrap gap-3">
                            <Button
                              size="sm"
                              disabled={
                                confirmMutation.isPending
                              }
                              onClick={() =>
                                handleConfirm(
                                  booking.id
                                )
                              }
                              className="bg-orange-500 text-white hover:bg-orange-600"
                            >
                              {confirmMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-4" />
                              )}

                              Confirm booking
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                cancelMutation.isPending
                              }
                              onClick={() =>
                                handleCancel(
                                  booking.id
                                )
                              }
                            >
                              {cancelMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <XCircle className="size-4" />
                              )}

                              Cancel booking
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                            >
                              <Link
                                to={`/property-details/${property.id}`}
                              >
                                Continue booking
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {booking.bookingStatus ===
                        "CONFIRMED" && (
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                          <CheckCircle2 className="size-5" />

                          Reservation confirmed
                        </div>
                      )}

                      {booking.bookingStatus ===
                        "CANCELLED" && (
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                          <XCircle className="size-5" />

                          Booking cancelled
                        </div>
                      )}

                      {booking.bookingStatus ===
                        "EXPIRED" && (
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-gray-100 p-4 text-sm font-semibold text-gray-600">
                          <Clock3 className="size-5" />

                          Booking expired
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  )
}