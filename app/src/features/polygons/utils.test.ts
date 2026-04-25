import { describe, expect, it } from "vitest"

import { findPolygonAtPoint, pointsToMiniSvgPath, roundPoint } from "./utils"
import type { Polygon } from "@/types/polygon"

describe("polygon utils", () => {
  it("rounds coordinates to a single decimal", () => {
    expect(roundPoint([10.04, 15.06])).toEqual([10, 15.1])
  })

  it("returns the top-most polygon containing a point", () => {
    const polygons: Polygon[] = [
      {
        id: 1,
        name: "Outer",
        color: "#111111",
        points: [
          [0, 0],
          [0, 20],
          [20, 20],
          [20, 0],
        ],
      },
      {
        id: 2,
        name: "Inner",
        color: "#222222",
        points: [
          [5, 5],
          [5, 15],
          [15, 15],
          [15, 5],
        ],
      },
    ]

    expect(findPolygonAtPoint(polygons, [10, 10])?.id).toBe(2)
    expect(findPolygonAtPoint(polygons, [30, 30])).toBeNull()
  })

  it("builds a compact preview path", () => {
    expect(
      pointsToMiniSvgPath([
        [10, 10],
        [20, 10],
        [20, 20],
      ])
    ).toBe("M 10.0 10.0 L 54.0 10.0 L 54.0 54.0")
  })
})
