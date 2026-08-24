import { useQuery } from "@tanstack/react-query"
import { fetchRoomTypeDetail } from "@/api/properties"

export function useRoomTypeDetail(
  propertyId: string | undefined,
  roomTypeId: string | undefined,
  startMonth: string,
  durationMonths: number
) {
  return useQuery({
    queryKey: [
      "room-type",
      propertyId,
      roomTypeId,
      startMonth,
      durationMonths,
    ],
    queryFn: () =>
      fetchRoomTypeDetail(
        propertyId!,
        roomTypeId!,
        startMonth,
        durationMonths
      ),
    enabled: Boolean(
      propertyId &&
        roomTypeId &&
        startMonth &&
        durationMonths
    ),
  })
}