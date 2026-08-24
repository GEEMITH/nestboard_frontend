import { Card } from "@/components/ui/card"
import { RoomCard } from "./RoomCard"
import type { Room } from "@/types/property"

type RoomListProps = {
  rooms: Room[]
}

export function RoomList({ rooms }: RoomListProps) {
  return (
    <Card className="gap-0 rounded-3xl p-6 shadow-sm ring-0">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Available Room Types
      </h2>
      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} {...room} />
        ))}
      </div>
    </Card>
  )
}
