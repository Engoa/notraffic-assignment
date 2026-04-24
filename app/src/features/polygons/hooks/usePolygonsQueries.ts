import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { polygonApi } from "@/api/services/polygons"
import type { CreatePolygonInput, UpdatePolygonInput } from "@/types/polygon"

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
      mutationFn: (input: CreatePolygonInput) => polygonApi.create(input),
      onSuccess: invalidatePolygons,
    }),
    updatePolygonMutation: useMutation({
      mutationFn: ({ id, input }: { id: number; input: UpdatePolygonInput }) =>
        polygonApi.update(id, input),
      onSuccess: invalidatePolygons,
    }),
    deletePolygonMutation: useMutation({
      mutationFn: (polygonId: number) => polygonApi.remove(polygonId),
      onSuccess: invalidatePolygons,
    }),
  }
}
