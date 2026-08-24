import { useEffect, useState } from "react"
import { AlertCircle, Clock3 } from "lucide-react"
import { useNavigate } from "react-router"

import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"
import {
  useConfirmBooking,
  useCreateBooking,
} from "@/hooks/useBookings"
import { useRoomTypeDetail } from "@/hooks/useRoomTypeDetail"

type BookingPanelProps = {
  propertyId: string
  roomTypeId: string
  roomTypeName: string
  monthlyPrice: string
  hasAC: boolean
  onClose: () => void
}

const DURATION_OPTIONS = [3, 6, 12]

function getCurrentMonth() {
  const date = new Date()

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`
}

function formatMonth(value: string) {
  const [year, month] = value.split("-")

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )
  )
}

function addMonths(
  startMonth: string,
  months: number
) {
  const [year, month] = startMonth
    .split("-")
    .map(Number)

  const date = new Date(
    year,
    month - 1 + months,
    1
  )

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`
}

export function BookingPanel({
  propertyId,
  roomTypeId,
  roomTypeName,
  monthlyPrice,
  hasAC,
  onClose,
}: BookingPanelProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [startMonth, setStartMonth] =
    useState(getCurrentMonth)

  const [durationMonths, setDurationMonths] =
    useState(3)

  const [selectedRoomId, setSelectedRoomId] =
    useState("")

  const [selectedSeat, setSelectedSeat] =
    useState<number | null>(null)

  const [createdBookingId, setCreatedBookingId] =
    useState<string | null>(() => {
      return sessionStorage.getItem(
        `nestboard_pending_booking_${propertyId}`
      )
    })

  const [createdAt, setCreatedAt] =
    useState<string | null>(() => {
      return sessionStorage.getItem(
        `nestboard_pending_booking_created_at_${propertyId}`
      )
    })

  const [error, setError] = useState("")

  const roomQuery = useRoomTypeDetail(
    propertyId,
    roomTypeId,
    startMonth,
    durationMonths
  )

  const createBooking = useCreateBooking()
  const confirmMutation = useConfirmBooking()

  const rooms = roomQuery.data?.rooms ?? []

  const selectedRoom = rooms.find(
    (room) => room.roomId === selectedRoomId
  )

  const price = Number(monthlyPrice)

  const total = Number.isFinite(price)
    ? price * durationMonths
    : 0

  useEffect(() => {
    setSelectedRoomId("")
    setSelectedSeat(null)
  }, [startMonth, durationMonths])

  function handleBook() {
    if (!user) {
      const returnTo =
        `${window.location.pathname}${window.location.search}`

      navigate(
        `/sign-in?returnTo=${encodeURIComponent(returnTo)}`
      )

      return
    }

    if (!selectedRoomId || selectedSeat === null) {
      setError("Select a room and an available seat.")
      return
    }

    setError("")

    createBooking.mutate(
      {
        roomId: selectedRoomId,
        seatNumber: selectedSeat,
        startMonth,
        durationMonths,
      },
      {
        onSuccess: (booking) => {
          const bookingId =
            typeof booking === "string"
              ? booking
              : booking?.id

          const bookingCreatedAt =
            typeof booking === "object" &&
            booking !== null &&
            "createdAt" in booking
              ? String(booking.createdAt)
              : new Date().toISOString()

          if (bookingId) {
            sessionStorage.setItem(
              `nestboard_pending_booking_${propertyId}`,
              bookingId
            )

            sessionStorage.setItem(
              `nestboard_pending_booking_created_at_${propertyId}`,
              bookingCreatedAt
            )

            setCreatedBookingId(bookingId)
            setCreatedAt(bookingCreatedAt)
          } else {
            navigate("/bookings", {
              replace: true,
            })
          }
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            if (
              err.status === 409 ||
              err.code === "CONFLICT"
            ) {
              setError(
                "This seat was just taken by another tenant. Availability has been refreshed."
              )

              void roomQuery.refetch()
              setSelectedSeat(null)
              return
            }

            setError(err.message)
            return
          }

          setError(
            "Unable to create the booking. Please try again."
          )
        },
      }
    )
  }

  function handleConfirm() {
    if (!createdBookingId) return

    setError("")

    confirmMutation.mutate(
      createdBookingId,
      {
        onSuccess: () => {
          sessionStorage.removeItem(
            `nestboard_pending_booking_${propertyId}`
          )

          sessionStorage.removeItem(
            `nestboard_pending_booking_created_at_${propertyId}`
          )

          setCreatedBookingId(null)
          setCreatedAt(null)

          navigate("/bookings", {
            replace: true,
          })
        },

        onError: (err) => {
          if (err instanceof ApiError) {
            if (
              err.status === 409 ||
              err.code === "CONFLICT"
            ) {
              setError(
                err.message ||
                  "The payment window has expired."
              )

              return
            }

            setError(err.message)
            return
          }

          setError(
            "Unable to confirm the booking."
          )
        },
      }
    )
  }

  if (createdBookingId && createdAt) {
    return (
      <PendingConfirmation
        createdAt={createdAt}
        onConfirm={handleConfirm}
        onClose={onClose}
        isConfirming={confirmMutation.isPending}
        error={error}
      />
    )
  }

  return (
    <Card
      className="
        mt-4
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
        text-gray-900
        shadow-xl
        ring-0
        sm:p-6
      "
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900">
            Book {roomTypeName}
          </h3>

          <p className="mt-1 text-sm font-medium text-gray-500">
            {hasAC ? "AC" : "Non-AC"} · LKR{" "}
            {price.toLocaleString()} / month
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="
            shrink-0
            rounded-lg
            bg-transparent
            px-3
            py-2
            text-sm
            font-semibold
            text-gray-600
            hover:bg-gray-100
            hover:text-gray-900
          "
        >
          Close
        </Button>
      </div>

      {/* LEASE OPTIONS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lease-start"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-800
            "
          >
            Lease start
          </label>

          <input
            id="lease-start"
            type="month"
            value={startMonth}
            min={getCurrentMonth()}
            onChange={(event) =>
              setStartMonth(event.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-base
              font-medium
              text-gray-900
              outline-none
              caret-orange-500
              transition
              focus:border-orange-500
              focus:ring-4
              focus:ring-orange-100
            "
          />
        </div>

        <div>
          <label
            htmlFor="lease-duration"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-800
            "
          >
            Duration
          </label>

          <select
            id="lease-duration"
            value={durationMonths}
            onChange={(event) =>
              setDurationMonths(
                Number(event.target.value)
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-base
              font-medium
              text-gray-900
              outline-none
              transition
              focus:border-orange-500
              focus:ring-4
              focus:ring-orange-100
            "
          >
            {DURATION_OPTIONS.map((duration) => (
              <option
                key={duration}
                value={duration}
                className="bg-white text-gray-900"
              >
                {duration} months
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LEASE SUMMARY */}
      <div
        className="
          mt-5
          rounded-2xl
          border
          border-gray-100
          bg-gray-50
          p-4
        "
      >
        <p className="text-sm font-medium text-gray-500">
          Lease
        </p>

        <p className="mt-1 text-base font-bold text-gray-900">
          {formatMonth(startMonth)} →{" "}
          {formatMonth(
            addMonths(
              startMonth,
              durationMonths
            )
          )}
        </p>
      </div>

      {/* ROOM SELECTION */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">
            Select room
          </p>

          {!roomQuery.isLoading &&
            !roomQuery.isError && (
              <span className="text-xs font-medium text-gray-500">
                {rooms.length}{" "}
                {rooms.length === 1
                  ? "room"
                  : "rooms"}
              </span>
            )}
        </div>

        {roomQuery.isLoading ? (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              p-5
              text-center
            "
          >
            <p className="text-sm font-medium text-gray-500">
              Loading rooms...
            </p>
          </div>
        ) : roomQuery.isError ? (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              font-medium
              text-red-700
            "
          >
            Could not load room availability.
          </div>
        ) : rooms.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              p-5
              text-center
            "
          >
            <p className="text-sm font-medium text-gray-600">
              No rooms are available for this lease
              period.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {rooms.map((room) => {
              const freeSeats =
                room.booking.filter(
                  (seat) => !seat.tenant
                ).length

              const isSelected =
                selectedRoomId === room.roomId

              return (
                <button
                  key={room.roomId}
                  type="button"
                  disabled={freeSeats === 0}
                  onClick={() => {
                    setSelectedRoomId(
                      room.roomId
                    )
                    setSelectedSeat(null)
                    setError("")
                  }}
                  className={[
                    `
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                    `,
                    isSelected
                      ? `
                        border-orange-500
                        bg-orange-50
                        shadow-sm
                      `
                      : `
                        border-gray-200
                        bg-white
                        hover:border-orange-300
                        hover:bg-orange-50/50
                        hover:shadow-sm
                      `,
                    freeSeats === 0
                      ? `
                        cursor-not-allowed
                        opacity-50
                      `
                      : "",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p
                      className={[
                        "font-semibold",
                        isSelected
                          ? "text-orange-700"
                          : "text-gray-900",
                      ].join(" ")}
                    >
                      {room.roomName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {freeSeats === 0
                        ? "No seats available"
                        : "Available for booking"}
                    </p>
                  </div>

                  <span
                    className={[
                      `
                        shrink-0
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                      `,
                      freeSeats === 0
                        ? `
                          bg-gray-100
                          text-gray-500
                        `
                        : `
                          bg-green-50
                          text-green-700
                        `,
                    ].join(" ")}
                  >
                    {freeSeats}{" "}
                    {freeSeats === 1
                      ? "free"
                      : "free"}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* SEAT SELECTION */}
      {selectedRoom && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-bold text-gray-900">
              Select seat
            </p>

            <span className="text-xs font-medium text-gray-500">
              Choose an available seat
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedRoom.booking.map(
              (seat) => {
                const available =
                  !seat.tenant

                const isSelected =
                  selectedSeat ===
                  seat.seatIndex

                return (
                  <button
                    key={seat.seatIndex}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      setSelectedSeat(
                        seat.seatIndex
                      )
                      setError("")
                    }}
                    className={[
                      `
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-sm
                        font-bold
                        transition-all
                      `,
                      isSelected
                        ? `
                          border-orange-500
                          bg-orange-500
                          text-white
                          shadow-sm
                        `
                        : available
                          ? `
                            border-gray-200
                            bg-white
                            text-gray-900
                            hover:border-orange-400
                            hover:bg-orange-50
                          `
                          : `
                            cursor-not-allowed
                            border-gray-200
                            bg-gray-100
                            text-gray-400
                          `,
                    ].join(" ")}
                  >
                    Seat {seat.seatIndex}

                    {!available && (
                      <span className="mt-0.5 block text-[10px] font-medium">
                        Occupied
                      </span>
                    )}

                    {isSelected && (
                      <span className="mt-0.5 block text-[10px] font-semibold text-white">
                        Selected
                      </span>
                    )}
                  </button>
                )
              }
            )}
          </div>
        </div>
      )}

      {/* PRICE SUMMARY */}
      <div
        className="
          mt-6
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-5
        "
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Monthly price
          </span>

          <span className="font-bold text-gray-900">
            LKR {price.toLocaleString()}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Duration
          </span>

          <span className="font-bold text-gray-900">
            {durationMonths} months
          </span>
        </div>

        <div className="my-4 border-t border-gray-200" />

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            Total
          </span>

          <span className="text-2xl font-bold text-orange-600">
            LKR {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="
            mt-5
            flex
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            font-medium
            text-red-700
          "
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />

          <span>{error}</span>
        </div>
      )}

      {/* RESERVE BUTTON */}
      <Button
        className="
          mt-6
          w-full
          rounded-xl
          bg-orange-500
          py-6
          text-base
          font-bold
          text-white
          shadow-sm
          hover:bg-orange-600
          hover:text-white
          disabled:bg-orange-300
          disabled:text-white
        "
        size="lg"
        disabled={
          createBooking.isPending ||
          !selectedRoomId ||
          selectedSeat === null ||
          roomQuery.isLoading
        }
        onClick={handleBook}
      >
        {createBooking.isPending
          ? "Holding seat..."
          : user
            ? "Reserve seat"
            : "Sign in to reserve"}
      </Button>
    </Card>
  )
}

type PendingConfirmationProps = {
  createdAt: string
  onConfirm: () => void
  onClose: () => void
  isConfirming: boolean
  error: string
}

function PendingConfirmation({
  createdAt,
  onConfirm,
  onClose,
  isConfirming,
  error,
}: PendingConfirmationProps) {
  const PAYMENT_WINDOW_MS = 60 * 1000

  const [remaining, setRemaining] = useState(
    Math.max(
      0,
      PAYMENT_WINDOW_MS -
        (Date.now() -
          new Date(createdAt).getTime())
    )
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(
        Math.max(
          0,
          PAYMENT_WINDOW_MS -
            (Date.now() -
              new Date(createdAt).getTime())
        )
      )
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [createdAt])

  const expired = remaining <= 0

  const minutes = Math.floor(
    remaining / 60000
  )

  const seconds = Math.floor(
    (remaining % 60000) / 1000
  )

  return (
    <Card
      className="
        mt-4
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-6
        text-gray-900
        shadow-xl
        ring-0
        sm:p-7
      "
    >
      {/* STATUS HEADER */}
      <div className="flex items-start gap-4">
        <div
          className={[
            `
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
            `,
            expired
              ? "bg-red-50"
              : "bg-orange-50",
          ].join(" ")}
        >
          {expired ? (
            <AlertCircle className="size-6 text-red-500" />
          ) : (
            <Clock3 className="size-6 text-orange-500" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900">
            {expired
              ? "Payment window expired"
              : "Seat temporarily reserved"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {expired
              ? "The seat hold has expired."
              : "Confirm your booking before the hold expires."}
          </p>
        </div>
      </div>

      {/* COUNTDOWN */}
      {!expired && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-orange-100
            bg-orange-50
            p-6
            text-center
          "
        >
          <p className="text-sm font-semibold text-gray-600">
            Time remaining
          </p>

          <p className="mt-2 text-5xl font-bold tabular-nums text-orange-600">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>

          <p className="mt-2 text-xs font-medium text-gray-500">
            Your seat is being held temporarily.
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div
          className="
            mt-5
            flex
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            font-medium
            text-red-700
          "
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />

          <span>{error}</span>
        </div>
      )}

      {/* CONFIRM */}
      {!expired && (
        <Button
          className="
            mt-6
            w-full
            rounded-xl
            bg-orange-500
            py-6
            text-base
            font-bold
            text-white
            hover:bg-orange-600
            hover:text-white
            disabled:bg-orange-300
            disabled:text-white
          "
          size="lg"
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming
            ? "Confirming..."
            : "Confirm booking"}
        </Button>
      )}

      {/* EXPIRED */}
      {expired && (
        <Button
          variant="outline"
          className="
            mt-6
            w-full
            rounded-xl
            border-gray-300
            bg-white
            py-6
            text-base
            font-bold
            text-gray-800
            hover:bg-gray-50
            hover:text-gray-900
          "
          onClick={onClose}
        >
          Choose another seat
        </Button>
      )}
    </Card>
  )
}