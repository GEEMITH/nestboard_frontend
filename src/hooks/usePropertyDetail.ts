import { useQuery } from "@tanstack/react-query"

import { fetchPropertyDetail } from "@/api/properties"

export function usePropertyDetail(
propertyId: string | undefined,
) {
return useQuery({
queryKey: ["property", propertyId],

queryFn: () => {
  if (!propertyId) {
    throw new Error("Property ID is required")
  }


  return fetchPropertyDetail(propertyId)
},


enabled: Boolean(propertyId),

})
}