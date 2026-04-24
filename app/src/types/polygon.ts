export type PolygonPoint = [number, number]

export type Polygon = {
  id: number
  name: string
  color: string
  points: PolygonPoint[]
}

export type CreatePolygonInput = {
  name: string
  color: string
  points: PolygonPoint[]
}

export type UpdatePolygonInput = {
  name: string
  color: string
}

export type PolygonDraft = {
  isDrawing: boolean
  name: string
  color: string
  points: PolygonPoint[]
}

export type PolygonEditor = {
  name: string
  color: string
}
