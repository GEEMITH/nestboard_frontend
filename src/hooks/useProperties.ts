import { useInfiniteQuery } from "@tanstack/react-query"

import {
fetchProperties,
type PropertyFilters,
} from "@/api/properties"

export function useProperties(
filters: Omit<PropertyFilters, "page"> = {},
) {
return useInfiniteQuery({
queryKey: ["properties", filters],

queryFn: ({ pageParam }) =>
  fetchProperties({
    ...filters,
    page: pageParam,
  }),


initialPageParam: 1,


getNextPageParam: (lastPage) =>
  lastPage.meta.hasNextPage
    ? lastPage.meta.page + 1
    : undefined,

})
}