import { useEffect, useMemo, useState } from "react"

import {
  Building2,
  ChevronDown,
  ChevronUp,
  Edit,
  Home,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react"

import {
  createProperty,
  createRoom,
  createRoomType,
  deleteProperty,
  deleteRoom,
  deleteRoomType,
  fetchAdminBookings,
  fetchAdminProperties,
  fetchRoomTypeDetail,
  fetchRoomTypes,
  resolveImageUrl,
  updateProperty,
  updateRoom,
  updateRoomType,
  uploadPropertyImage,
  type AdminBooking,
  type AdminProperty,
  type AdminRoom,
  type AdminRoomType,
} from "@/api/admin"

import { useAuthStore } from "@/stores/authStore"

type PropertyForm = {
  title: string
  description: string
  address: string
  city: string
  type: AdminProperty["type"]
  amenities: string
  latitude: string
  longitude: string
  imageUrl: string
  minStay: string
  isActive: boolean
}

type RoomTypeForm = {
  name: string
  pricePerMonth: string
  seatCapacity: string
  hasAC: boolean
  isAvailable: boolean
}

type RoomForm = {
  roomLabel: string
  isAvailable: boolean
}

const emptyPropertyForm: PropertyForm = {
  title: "",
  description: "",
  address: "",
  city: "",
  type: "APARTMENT",
  amenities: "",
  latitude: "0",
  longitude: "0",
  imageUrl: "",
  minStay: "1 month",
  isActive: true,
}

const emptyRoomTypeForm: RoomTypeForm = {
  name: "",
  pricePerMonth: "",
  seatCapacity: "1",
  hasAC: false,
  isAvailable: true,
}

const emptyRoomForm: RoomForm = {
  roomLabel: "",
  isAvailable: true,
}

function toPropertyForm(property: AdminProperty): PropertyForm {
  return {
    title: property.title,
    description: property.description,
    address: property.address,
    city: property.city,
    type: property.type,
    amenities: property.amenities.join(", "),
    latitude: String(property.latitude),
    longitude: String(property.longitude),
    imageUrl: property.imageUrl,
    minStay: property.minStay,
    isActive: property.isActive,
  }
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString()
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function statusClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700"

    case "PENDING":
      return "bg-yellow-100 text-yellow-700"

    case "CANCELLED":
      return "bg-red-100 text-red-700"

    case "EXPIRED":
      return "bg-gray-100 text-gray-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)

  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [bookings, setBookings] = useState<AdminBooking[]>([])

  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  const [propertyModal, setPropertyModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null)
  const [propertyForm, setPropertyForm] = useState<PropertyForm>(emptyPropertyForm)
  const [savingProperty, setSavingProperty] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [expandedProperty, setExpandedProperty] = useState<string | null>(null)

  const [roomTypes, setRoomTypes] = useState<Record<string, AdminRoomType[]>>({})
  const [rooms, setRooms] = useState<Record<string, AdminRoom[]>>({})
  const [roomLoading, setRoomLoading] = useState<string | null>(null)

  const [roomTypeModal, setRoomTypeModal] = useState<{
    propertyId: string
    roomType?: AdminRoomType
  } | null>(null)

  const [roomTypeForm, setRoomTypeForm] = useState<RoomTypeForm>(emptyRoomTypeForm)

  const [roomModal, setRoomModal] = useState<{
    propertyId: string
    roomTypeId: string
    room?: AdminRoom
  } | null>(null)

  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm)

  const [savingRoomType, setSavingRoomType] = useState(false)
  const [savingRoom, setSavingRoom] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadProperties() {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchAdminProperties()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties")
    } finally {
      setLoading(false)
    }
  }

  async function loadBookings() {
    setBookingsLoading(true)
    setBookingError(null)

    try {
      const data = await fetchAdminBookings()
      setBookings(data)
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    void loadProperties()
    void loadBookings()
  }, [])

  const totalRooms = useMemo(
    () =>
      Object.values(roomTypes).reduce(
        (total, types) =>
          total +
          types.reduce((sum, type) => sum + (rooms[type.id]?.length ?? 0), 0),
        0,
      ),
    [roomTypes, rooms],
  )

  const confirmedBookings = bookings.filter((booking) => booking.status === "CONFIRMED")

  const revenue = confirmedBookings.reduce(
    (total, booking) => total + Number(booking.totalAmount),
    0,
  )

  const totalCapacity = Object.values(roomTypes).reduce(
    (total, types) =>
      total +
      types.reduce(
        (sum, type) => sum + type.seatCapacity * (rooms[type.id]?.length ?? 0),
        0,
      ),
    0,
  )

  const occupancy =
    totalCapacity > 0
      ? Math.round((confirmedBookings.length / totalCapacity) * 100)
      : 0

  function openCreateProperty() {
    setEditingProperty(null)
    setPropertyForm(emptyPropertyForm)
    setPropertyModal(true)
  }

  function openEditProperty(property: AdminProperty) {
    setEditingProperty(property)
    setPropertyForm(toPropertyForm(property))
    setPropertyModal(true)
  }

  function closePropertyModal() {
    if (savingProperty) return

    setPropertyModal(false)
    setEditingProperty(null)
  }

  async function saveProperty() {
    if (!propertyForm.title.trim()) {
      alert("Property title is required")
      return
    }

    if (!propertyForm.description.trim()) {
      alert("Property description is required")
      return
    }

    if (!propertyForm.address.trim()) {
      alert("Property address is required")
      return
    }

    if (!propertyForm.city.trim()) {
      alert("Property city is required")
      return
    }

    if (!propertyForm.imageUrl.trim()) {
      alert("Please upload a property image before saving.")
      return
    }

    const latitude = Number(propertyForm.latitude)
    const longitude = Number(propertyForm.longitude)

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      alert("Latitude must be a number between -90 and 90.")
      return
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      alert("Longitude must be a number between -180 and 180.")
      return
    }

    setSavingProperty(true)

    try {
      const payload = {
        title: propertyForm.title.trim(),
        description: propertyForm.description.trim(),
        address: propertyForm.address.trim(),
        city: propertyForm.city.trim(),
        type: propertyForm.type,
        amenities: propertyForm.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        latitude,
        longitude,
        imageUrl: propertyForm.imageUrl.trim(),
        minStay: propertyForm.minStay.trim(),
        isActive: propertyForm.isActive,
      }

      if (editingProperty) {
        await updateProperty(editingProperty.id, payload)
      } else {
        await createProperty(payload)
      }

      closePropertyModal()
      await loadProperties()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save property")
    } finally {
      setSavingProperty(false)
    }
  }

  async function removeProperty(property: AdminProperty) {
    if (!window.confirm(`Delete "${property.title}"?`)) {
      return
    }

    setDeletingId(property.id)

    try {
      await deleteProperty(property.id)
      setProperties((current) => current.filter((item) => item.id !== property.id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property")
    } finally {
      setDeletingId(null)
    }
  }

  async function uploadImage(file: File) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Property image must be 5 MB or smaller.")
      return
    }

    setUploadingImage(true)

    try {
      const result = await uploadPropertyImage(file)

      if (!result.url) {
        throw new Error("The server did not return an image URL.")
      }

      setPropertyForm((current) => ({
        ...current,
        imageUrl: result.url,
      }))
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Image upload failed",
      )
    } finally {
      setUploadingImage(false)
    }
  }

  async function toggleProperty(property: AdminProperty) {
    try {
      await updateProperty(property.id, { isActive: !property.isActive })
      await loadProperties()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update property")
    }
  }

  async function expandProperty(propertyId: string) {
    if (expandedProperty === propertyId) {
      setExpandedProperty(null)
      return
    }

    setExpandedProperty(propertyId)

    if (roomTypes[propertyId]) {
      return
    }

    setRoomLoading(propertyId)

    try {
      const data = await fetchRoomTypes(propertyId)
      setRoomTypes((current) => ({ ...current, [propertyId]: data }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load room types")
    } finally {
      setRoomLoading(null)
    }
  }

  async function refreshRoomTypes(propertyId: string) {
    const data = await fetchRoomTypes(propertyId)
    setRoomTypes((current) => ({ ...current, [propertyId]: data }))
  }

  async function loadRooms(propertyId: string, roomTypeId: string) {
    try {
      const detail = await fetchRoomTypeDetail(propertyId, roomTypeId)

      const mappedRooms: AdminRoom[] = detail.rooms.map((room) => ({
        id: room.id,

roomTypeId,

roomLabel: room.roomLabel,

isAvailable: room.isAvailable,
      }))

      setRooms((current) => ({ ...current, [roomTypeId]: mappedRooms }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load rooms")
    }
  }

  function openCreateRoomType(propertyId: string) {
    setRoomTypeModal({ propertyId })
    setRoomTypeForm(emptyRoomTypeForm)
  }

  function openEditRoomType(propertyId: string, roomType: AdminRoomType) {
    setRoomTypeModal({ propertyId, roomType })

    setRoomTypeForm({
      name: roomType.name,
      pricePerMonth: String(roomType.pricePerMonth),
      seatCapacity: String(roomType.seatCapacity),
      hasAC: roomType.hasAC,
      isAvailable: roomType.isAvailable,
    })
  }

  async function saveRoomType() {
    if (!roomTypeModal) return

    setSavingRoomType(true)

    try {
      const payload = {
        name: roomTypeForm.name.trim(),
        pricePerMonth: Number(roomTypeForm.pricePerMonth),
        seatCapacity: Number(roomTypeForm.seatCapacity),
        hasAC: roomTypeForm.hasAC,
        isAvailable: roomTypeForm.isAvailable,
      }

      if (roomTypeModal.roomType) {
        await updateRoomType(roomTypeModal.propertyId, roomTypeModal.roomType.id, payload)
      } else {
        await createRoomType(roomTypeModal.propertyId, payload)
      }

      await refreshRoomTypes(roomTypeModal.propertyId)
      setRoomTypeModal(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save room type")
    } finally {
      setSavingRoomType(false)
    }
  }

  async function removeRoomType(propertyId: string, roomType: AdminRoomType) {
    if (!window.confirm(`Delete room type "${roomType.name}"?`)) {
      return
    }

    try {
      await deleteRoomType(propertyId, roomType.id)
      await refreshRoomTypes(propertyId)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete room type")
    }
  }

  function openCreateRoom(propertyId: string, roomTypeId: string) {
    setRoomModal({ propertyId, roomTypeId })
    setRoomForm(emptyRoomForm)
  }

  function openEditRoom(propertyId: string, roomTypeId: string, room: AdminRoom) {
    setRoomModal({ propertyId, roomTypeId, room })

    setRoomForm({
      roomLabel: room.roomLabel,
      isAvailable: room.isAvailable,
    })
  }

  async function saveRoom() {
    if (!roomModal) return

    setSavingRoom(true)

    try {
      const payload = {
        roomLabel: roomForm.roomLabel.trim(),
        isAvailable: roomForm.isAvailable,
      }

      if (roomModal.room) {
        await updateRoom(roomModal.propertyId, roomModal.roomTypeId, roomModal.room.id, payload)
      } else {
        await createRoom(roomModal.propertyId, roomModal.roomTypeId, payload)
      }

      await loadRooms(roomModal.propertyId, roomModal.roomTypeId)
      setRoomModal(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save room")
    } finally {
      setSavingRoom(false)
    }
  }

  async function removeRoom(propertyId: string, roomTypeId: string, room: AdminRoom) {
    if (!window.confirm(`Delete room "${room.roomLabel}"?`)) {
      return
    }

    try {
      await deleteRoom(propertyId, roomTypeId, room.id)
      await loadRooms(propertyId, roomTypeId)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete room")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Welcome, {user?.displayName ?? "Admin"}
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your properties, rooms and bookings.
            </p>
          </div>

          <button
            onClick={openCreateProperty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Building2 className="h-5 w-5" />} label="Properties" value={properties.length} />
          <Stat icon={<Home className="h-5 w-5" />} label="Rooms" value={totalRooms} />
          <Stat icon={<Users className="h-5 w-5" />} label="Bookings" value={bookings.length} />
          <Stat
            icon={<span className="text-lg font-bold">Rs</span>}
            label="Confirmed Revenue"
            value={`Rs ${formatMoney(revenue)}`}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Seat Occupancy</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{occupancy}%</p>
            </div>

            <div className="h-3 w-48 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${Math.min(occupancy, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <p className="mt-1 text-sm text-gray-500">
                Only properties owned by your account are shown.
              </p>
            </div>
          </div>

          {loading && <Loading />}

          {error && <ErrorBox message={error} />}

          {!loading && !error && properties.length === 0 && (
            <Empty
              title="No properties yet"
              text="Create your first property to start managing your inventory."
              action={
                <button
                  onClick={openCreateProperty}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Add Property
                </button>
              }
            />
          )}

          <div className="space-y-4">
            {properties.map((property) => {
              const expanded = expandedProperty === property.id
              const types = roomTypes[property.id] ?? []

              return (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 lg:w-48">
                        {property.imageUrl ? (
                          <img
                            src={resolveImageUrl(property.imageUrl)}
                            alt={property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <Building2 />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {property.type}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              property.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {property.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {property.address}, {property.city}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {property.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(property.amenities ?? []).map((amenity) => (
                            <span
                              key={amenity}
                              className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col">
                        <button
                          onClick={() => expandProperty(property.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          Rooms
                        </button>

                        <button
                          onClick={() => openEditProperty(property)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          onClick={() => toggleProperty(property)}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                        >
                          {property.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          disabled={deletingId === property.id}
                          onClick={() => removeProperty(property)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">Room Types</h4>
                          <p className="text-sm text-gray-500">
                            Manage pricing, capacity and rooms.
                          </p>
                        </div>

                        <button
                          onClick={() => openCreateRoomType(property.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Room Type
                        </button>
                      </div>

                      {roomLoading === property.id && <Loading />}

                      {!roomLoading && types.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                          No room types.
                        </div>
                      )}

                      <div className="space-y-3">
                        {types.map((roomType) => (
                          <RoomTypeRow
                            key={roomType.id}
                            roomType={roomType}
                            rooms={rooms[roomType.id] ?? []}
                            onEdit={() => openEditRoomType(property.id, roomType)}
                            onDelete={() => removeRoomType(property.id, roomType)}
                            onAddRoom={() => openCreateRoom(property.id, roomType.id)}
                            onEditRoom={(room) => openEditRoom(property.id, roomType.id, room)}
                            onDeleteRoom={(room) => removeRoom(property.id, roomType.id, room)}
                            onLoadRooms={() => loadRooms(property.id, roomType.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Inventory Bookings</h2>
            <p className="mt-1 text-sm text-gray-500">Bookings across your own properties.</p>
          </div>

          {bookingsLoading && <Loading />}

          {bookingError && <ErrorBox message={bookingError} />}

          {!bookingsLoading && !bookingError && bookings.length === 0 && (
            <Empty title="No bookings" text="Bookings for your properties will appear here." />
          )}

          {!bookingsLoading && !bookingError && bookings.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-gray-600">Tenant</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Property</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Room</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Seat</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Lease</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Amount</th>
                    <th className="px-5 py-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {booking.tenant.displayName}
                        </p>
                        <p className="text-xs text-gray-500">{booking.tenant.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {booking.room.roomType.property.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.room.roomType.property.city}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {booking.room.roomLabel}
                        <p className="text-xs text-gray-500">{booking.room.roomType.name}</p>
                      </td>

                      <td className="px-5 py-4 font-semibold">#{booking.seatNumber}</td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p>{formatDate(booking.leaseStart)}</p>
                        <p className="text-xs text-gray-500">
                          to {formatDate(booking.leaseEnd)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                        Rs {formatMoney(booking.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {propertyModal && (
        <Modal title={editingProperty ? "Edit Property" : "Create Property"} onClose={closePropertyModal}>
          <div className="space-y-4">
            <Input
              label="Title"
              value={propertyForm.title}
              onChange={(value) => setPropertyForm((current) => ({ ...current, title: value }))}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Description</span>
              <textarea
                value={propertyForm.description}
                onChange={(event) =>
                  setPropertyForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-teal-500"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Address"
                value={propertyForm.address}
                onChange={(value) => setPropertyForm((current) => ({ ...current, address: value }))}
              />

              <Input
                label="City"
                value={propertyForm.city}
                onChange={(value) => setPropertyForm((current) => ({ ...current, city: value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Property Type</span>
                <select
                  value={propertyForm.type}
                  onChange={(event) =>
                    setPropertyForm((current) => ({
                      ...current,
                      type: event.target.value as AdminProperty["type"],
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
                >
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOTEL">Hotel</option>
                </select>
              </label>

              <Input
                label="Minimum Stay"
                value={propertyForm.minStay}
                onChange={(value) => setPropertyForm((current) => ({ ...current, minStay: value }))}
              />
            </div>

            <Input
              label="Amenities (comma separated)"
              value={propertyForm.amenities}
              onChange={(value) => setPropertyForm((current) => ({ ...current, amenities: value }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Latitude"
                value={propertyForm.latitude}
                onChange={(value) => setPropertyForm((current) => ({ ...current, latitude: value }))}
              />

              <Input
                label="Longitude"
                value={propertyForm.longitude}
                onChange={(value) => setPropertyForm((current) => ({ ...current, longitude: value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Property Image</label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50">
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Upload Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadImage(file)
                      }
                    }}
                  />
                </label>

                {propertyForm.imageUrl && (
                  <img
                    src={resolveImageUrl(propertyForm.imageUrl)}
                    alt="Preview"
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <input
                type="checkbox"
                checked={propertyForm.isActive}
                onChange={(event) =>
                  setPropertyForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              <span className="text-sm font-semibold">Property is active</span>
            </label>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={closePropertyModal}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={savingProperty || uploadingImage}
                onClick={() => void saveProperty()}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingProperty && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Save Property
              </button>
            </div>
          </div>
        </Modal>
      )}

      {roomTypeModal && (
        <Modal
          title={roomTypeModal.roomType ? "Edit Room Type" : "Create Room Type"}
          onClose={() => !savingRoomType && setRoomTypeModal(null)}
        >
          <div className="space-y-4">
            <Input
              label="Name"
              value={roomTypeForm.name}
              onChange={(value) => setRoomTypeForm((current) => ({ ...current, name: value }))}
            />

            <Input
              label="Price Per Month"
              type="number"
              value={roomTypeForm.pricePerMonth}
              onChange={(value) =>
                setRoomTypeForm((current) => ({ ...current, pricePerMonth: value }))
              }
            />

            <Input
              label="Seat Capacity"
              type="number"
              value={roomTypeForm.seatCapacity}
              onChange={(value) =>
                setRoomTypeForm((current) => ({ ...current, seatCapacity: value }))
              }
            />

            <Check
              label="Has AC"
              checked={roomTypeForm.hasAC}
              onChange={(checked) => setRoomTypeForm((current) => ({ ...current, hasAC: checked }))}
            />

            <Check
              label="Available"
              checked={roomTypeForm.isAvailable}
              onChange={(checked) =>
                setRoomTypeForm((current) => ({ ...current, isAvailable: checked }))
              }
            />

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setRoomTypeModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={savingRoomType}
                onClick={() => void saveRoomType()}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingRoomType && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Room Type
              </button>
            </div>
          </div>
        </Modal>
      )}

      {roomModal && (
        <Modal
          title={roomModal.room ? "Edit Room" : "Create Room"}
          onClose={() => !savingRoom && setRoomModal(null)}
        >
          <div className="space-y-4">
            <Input
              label="Room Label"
              value={roomForm.roomLabel}
              onChange={(value) => setRoomForm((current) => ({ ...current, roomLabel: value }))}
            />

            <Check
              label="Available"
              checked={roomForm.isAvailable}
              onChange={(checked) => setRoomForm((current) => ({ ...current, isAvailable: checked }))}
            />

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setRoomModal(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={savingRoom}
                onClick={() => void saveRoom()}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingRoom && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Room
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>

      <p className="mt-5 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-gray-500">{label}</p>
    </div>
  )
}

function RoomTypeRow({
  roomType,
  rooms,
  onEdit,
  onDelete,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onLoadRooms,
}: {
  roomType: AdminRoomType
  rooms: AdminRoom[]
  onEdit: () => void
  onDelete: () => void
  onAddRoom: () => void
  onEditRoom: (room: AdminRoom) => void
  onDeleteRoom: (room: AdminRoom) => void
  onLoadRooms: () => void
}) {
  const [open, setOpen] = useState(false)

  function toggle() {
    setOpen((current) => !current)

    if (!open) {
      void onLoadRooms()
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <button onClick={toggle} className="flex flex-1 items-center gap-3 text-left">
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}

          <div>
            <p className="font-bold text-gray-900">{roomType.name}</p>
            <p className="text-sm text-gray-500">
              Rs {formatMoney(roomType.pricePerMonth)}/month · {roomType.seatCapacity} seats ·{" "}
              {roomType.hasAC ? "AC" : "Non-AC"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              roomType.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {roomType.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
          </span>

          <button onClick={onAddRoom} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold">
            + Room
          </button>

          <button onClick={onEdit} className="rounded-lg border border-gray-200 p-2">
            <Edit className="h-4 w-4" />
          </button>

          <button onClick={onDelete} className="rounded-lg border border-red-200 p-2 text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 p-4">
          {rooms.length === 0 ? (
            <p className="text-sm text-gray-500">No rooms created.</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{room.roomLabel}</p>
                    <p className={`text-xs ${room.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {room.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => onEditRoom(room)} className="rounded-lg border border-gray-200 p-2">
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onDeleteRoom(room)}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-teal-500"
      />
    </label>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </label>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-10">
      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  )
}

function Empty({
  title,
  text,
  action,
}: {
  title: string
  text: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}