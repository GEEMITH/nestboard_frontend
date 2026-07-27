import { useQuery } from "@tanstack/react-query"
import { fetchPropertyDetail } from "@/api/properties"

export function usePropertyDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchPropertyDetail(id!),
    enabled: !!id, // don't fetch if id is missing
  })
}
