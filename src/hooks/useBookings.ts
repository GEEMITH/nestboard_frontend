import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  cancelBooking,
  confirmBooking,
  createPendingBooking,
  fetchMyBookings,
  type CreateBookingInput,
} from "@/api/bookings"

export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      createPendingBooking(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      })

      void queryClient.invalidateQueries({
        queryKey: ["property"],
      })
    },
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) =>
      confirmBooking(bookingId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      })

      void queryClient.invalidateQueries({
        queryKey: ["property"],
      })

      void queryClient.invalidateQueries({
        queryKey: ["room-type"],
      })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) =>
      cancelBooking(bookingId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-bookings"],
      })

      void queryClient.invalidateQueries({
        queryKey: ["property"],
      })

      void queryClient.invalidateQueries({
        queryKey: ["room-type"],
      })
    },
  })
}