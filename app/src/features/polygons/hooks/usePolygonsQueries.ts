import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { polygonApi } from "@/api/services/polygons"
import type { UpdatePolygonInput } from "@/types/polygon"

const polygonKeys = {
  all: ["polygons"] as const,
}

export function usePolygonsQueries() {
  const queryClient = useQueryClient()

  const invalidatePolygons = async () => {
    await queryClient.invalidateQueries({ queryKey: polygonKeys.all })
  }

  return {
    polygonsQuery: useQuery({
      queryKey: polygonKeys.all,
      queryFn: polygonApi.list,
    }),
    createPolygonMutation: useMutation({
      mutationFn: polygonApi.create,
      onSuccess: invalidatePolygons,
    }),
    updatePolygonMutation: useMutation({
      mutationFn: ({ id, input }: { id: number; input: UpdatePolygonInput }) => polygonApi.update(id, input),
      onSuccess: invalidatePolygons,
    }),
    deletePolygonMutation: useMutation({
      mutationFn: polygonApi.remove,
      onSuccess: invalidatePolygons,
    }),
  }
}
