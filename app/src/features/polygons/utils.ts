import type { Polygon, PolygonPoint } from "@/types/polygon"

export function roundPoint(point: PolygonPoint): PolygonPoint {
  return [Number(point[0].toFixed(1)), Number(point[1].toFixed(1))]
}

export function formatPoint(point: PolygonPoint): string {
  return `${formatCoordinate(point[0])}, ${formatCoordinate(point[1])}`
}

export function formatCoordinate(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function isPointInsidePolygon(point: PolygonPoint, polygonPoints: PolygonPoint[]): boolean {
  let isInside = false
  const [x, y] = point

  // Basic ray-casting check. each edge crossing flips the flag.
  for (let index = 0; index < polygonPoints.length; index += 1) {
    const previousIndex = index === 0 ? polygonPoints.length - 1 : index - 1

    const [currentX, currentY] = polygonPoints[index]
    const [previousX, previousY] = polygonPoints[previousIndex]

    const intersects =
      currentY > y !== previousY > y &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX

    if (intersects) {
      isInside = !isInside
    }
  }

  return isInside
}

export function findPolygonAtPoint(polygons: Polygon[], point: PolygonPoint): Polygon | null {
  for (let index = polygons.length - 1; index >= 0; index -= 1) {
    if (isPointInsidePolygon(point, polygons[index].points)) {
      return polygons[index]
    }
  }

  return null
}

export function hexToRgba(color: string, alpha: number): string {
  const normalized = color.replace("#", "")
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function getPolygonStyle(color: string) {
  return {
    stroke: color,
    fill: hexToRgba(color, 0.16),
    mutedFill: hexToRgba(color, 0.08),
    draftFill: hexToRgba(color, 0.12),
    halo: hexToRgba(color, 0.18),
    draftHalo: hexToRgba(color, 0.26),
    dot: color,
  }
}

export function pointsToMiniSvgPath(points: PolygonPoint[]): string {
  if (points.length === 0) return ""

  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = Math.max(maxX - minX, 1)
  const height = Math.max(maxY - minY, 1)

  return points
    .map(([x, y], index) => {
      // Keep the preview inside a small padded box so skinny shapes dont hug the edges.
      const normalizedX = 10 + ((x - minX) / width) * 44
      const normalizedY = 10 + ((y - minY) / height) * 44
      return `${index === 0 ? "M" : "L"} ${normalizedX.toFixed(1)} ${normalizedY.toFixed(1)}`
    })
    .join(" ")
}
