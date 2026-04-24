import { requestJson } from "@/api/utils"
import type {
  CreatePolygonInput,
  Polygon,
  UpdatePolygonInput,
} from "@/types/polygon"

export const polygonApi = {
  list: () => requestJson<Polygon[]>("polygons"),

  create: (input: CreatePolygonInput) =>
    requestJson<Polygon>("polygons", { method: "POST", json: input }),

  update: (id: number, input: UpdatePolygonInput) =>
    requestJson<Polygon>(`polygons/${id}`, { method: "PATCH", json: input }),

  remove: (id: number) =>
    requestJson<{ id: number }>(`polygons/${id}`, { method: "DELETE" }),
}
