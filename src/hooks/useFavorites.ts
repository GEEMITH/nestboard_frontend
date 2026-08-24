import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  fetchFavoriteProperties,
  toggleFavorite,
} from "@/api/properties"

export function useFavoriteProperties() {
  return useQuery({
    queryKey: ["favorites"],

    queryFn: fetchFavoriteProperties,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleFavorite,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favorites"],
      })

      queryClient.invalidateQueries({
        queryKey: ["properties"],
      })

      queryClient.invalidateQueries({
        queryKey: ["property"],
      })
    },
  })
}