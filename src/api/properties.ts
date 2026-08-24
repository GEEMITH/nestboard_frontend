import type { Property, PropertyDetail } from "@/types/property"

export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("http://localhost:3001/api/properties")
  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}
export async function fetchPropertyDetail(id: string): Promise<PropertyDetail> {
  const res = await fetch(`http://localhost:3001/api/properties/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch property: ${id}`)
  return res.json()
}
