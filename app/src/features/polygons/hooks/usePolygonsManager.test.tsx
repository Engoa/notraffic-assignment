import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Polygon } from "@/types/polygon"
import { DEFAULT_POLYGON_COLOR } from "../constants"
import { usePolygonsManager } from "./usePolygonsManager"

const { mockUsePolygonsQueries } = vi.hoisted(() => ({
  mockUsePolygonsQueries: vi.fn(),
}))

vi.mock("./usePolygonsQueries", () => ({
  usePolygonsQueries: () => mockUsePolygonsQueries(),
}))

function createMutationMock() {
  return {
    isPending: false,
    mutate: vi.fn(),
  }
}

function buildPolygon(overrides: Partial<Polygon> = {}): Polygon {
  return {
    id: 1,
    name: "Triangle",
    color: "#22AA66",
    points: [
      [0, 0],
      [100, 0],
      [50, 50],
    ],
    ...overrides,
  }
}

describe("usePolygonsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a polygon and selects it on success", () => {
    const createdPolygon = buildPolygon({ id: 7, name: "Test" })
    const createPolygonMutation = createMutationMock()

    createPolygonMutation.mutate.mockImplementation((_input, options) => {
      options?.onSuccess?.(createdPolygon)
    })

    mockUsePolygonsQueries.mockReturnValue({
      polygonsQuery: {
        data: [createdPolygon],
        isLoading: false,
      },
      createPolygonMutation,
      updatePolygonMutation: createMutationMock(),
      deletePolygonMutation: createMutationMock(),
    })

    const { result } = renderHook(() => usePolygonsManager())

    act(() => {
      result.current.addDraftPoint([10.04, 20.05])
      result.current.addDraftPoint([30.16, 40.27])
      result.current.addDraftPoint([50.38, 60.49])
      result.current.completeDraftOutline()
    })

    act(() => {
      result.current.setForm({ name: "  Test  ", color: "#22aa66" })
    })

    act(() => {
      result.current.saveDraft()
    })

    expect(createPolygonMutation.mutate).toHaveBeenCalledWith(
      {
        name: "Test",
        color: "#22AA66",
        points: [
          [10, 20.1],
          [30.2, 40.3],
          [50.4, 60.5],
        ],
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    )
    expect(result.current.draft).toEqual({ isDrawing: false, points: [] })
    expect(result.current.form).toEqual({
      name: "Test",
      color: "#22AA66",
    })
    expect(result.current.selectedPolygonId).toBe(7)
  })

  it("deletes the selected polygon and clears the editor state", () => {
    const polygon = buildPolygon()
    const deletePolygonMutation = createMutationMock()

    deletePolygonMutation.mutate.mockImplementation((_polygonId, options) => {
      options?.onSuccess?.({ id: polygon.id })
    })

    mockUsePolygonsQueries.mockReturnValue({
      polygonsQuery: {
        data: [polygon],
        isLoading: false,
      },
      createPolygonMutation: createMutationMock(),
      updatePolygonMutation: createMutationMock(),
      deletePolygonMutation,
    })

    const { result } = renderHook(() => usePolygonsManager())

    act(() => {
      result.current.selectPolygon(polygon.id)
    })

    act(() => {
      result.current.deleteSelectedPolygon()
    })

    expect(deletePolygonMutation.mutate).toHaveBeenCalledWith(
      polygon.id,
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    )
    expect(result.current.selectedPolygonId).toBeNull()
    expect(result.current.form).toEqual({
      name: "",
      color: DEFAULT_POLYGON_COLOR,
    })
  })
})
