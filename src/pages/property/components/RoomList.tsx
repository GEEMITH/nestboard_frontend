import { useState } from "react"
import { Card } from "@/components/ui/card"
import { RoomCard } from "./RoomCard"
import { BookingPanel } from "./BookingPanel"
import type { Room } from "@/types/property"

type RoomListProps = {
  propertyId: string
  rooms: Room[]
}

export function RoomList({
  propertyId,
  rooms,
}: RoomListProps) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] =
    useState<string | null>(null)

  const selectedRoomType = rooms.find(
    (room) => room.id === selectedRoomTypeId
  )

  return (
    <Card className="gap-0 rounded-3xl p-6 shadow-sm ring-0">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Available Room Types
      </h2>

      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <div key={room.id}>
            <RoomCard
              {...room}
              onBook={() =>
                setSelectedRoomTypeId(room.id)
              }
            />

            {selectedRoomTypeId === room.id &&
              selectedRoomType && (
                <BookingPanel
                  propertyId={propertyId}
                  roomTypeId={selectedRoomType.id}
                  roomTypeName={selectedRoomType.name}
                  monthlyPrice={
                    selectedRoomType.price
                  }
                  hasAC={
                    selectedRoomType.hasAC
                  }
                  onClose={() =>
                    setSelectedRoomTypeId(null)
                  }
                />
              )}
          </div>
        ))}
      </div>
    </Card>
  )
}