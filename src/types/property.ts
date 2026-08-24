export type Property = {
  id: string
  title: string
  description?: string
  location: string
  type: "House" | "Villa" | "Apartment" | "Hotel"
  price: string
  rating: number
  image: string
  lat?: number
  lng?: number
  isFavorite?: boolean
}

export type Room = {
  id: string
  name: string
  price: string
  seatsTotal: number
  seatsFree: number
  hasAC: boolean
}

export type PropertyDetail = {
  id: string
  title: string
  address: string
  city?: string
  description?: string
  amenities: string[]
  rating: number
  seatsAvailable: number
  minStay: string
  startingPrice: string
  image: string
  latitude?: number
  longitude?: number
  isFavorite?: boolean
  rooms: Room[]
}