import { useQuery } from "@tanstack/react-query"
import { fetchProperties } from "@/api/properties"

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  })
}
