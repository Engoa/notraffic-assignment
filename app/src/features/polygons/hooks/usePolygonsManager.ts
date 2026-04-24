import { startTransition, useState } from "react"
import { toast } from "sonner"

import type { PolygonDraft, PolygonEditor, PolygonPoint } from "@/types/polygon"
import { polygonDraftSchema, updatePolygonSchema } from "@/schemas/polygons"
import { getApiErrorMessage } from "@/utils/getApiErrorMessage"
import { DEFAULT_POLYGON_COLOR } from "../constants"
import { roundPoint } from "../utils"
import { usePolygonsQueries } from "./usePolygonsQueries"

function createEmptyDraft(): PolygonDraft {
  return {
    isDrawing: false,
    name: "",
    color: DEFAULT_POLYGON_COLOR,
    points: [],
  }
}

function createEmptyEditor(): PolygonEditor {
  return {
    name: "",
    color: DEFAULT_POLYGON_COLOR,
  }
}

function normalizePolygonEditorValue(value: PolygonEditor) {
  return {
    name: value.name.trim(),
    color: value.color.trim().toUpperCase(),
  }
}

function getHasPolygonChanges(
  polygon: { name: string; color: string } | null,
  editor: PolygonEditor
) {
  if (!polygon) return false

  // Compare normalized values so stuff like whitespace and such are trimmed
  const normalizedEditor = normalizePolygonEditorValue(editor)
  const normalizedPolygon = normalizePolygonEditorValue(polygon)

  return (
    normalizedEditor.name !== normalizedPolygon.name ||
    normalizedEditor.color !== normalizedPolygon.color
  )
}

export function usePolygonsManager() {
  const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(
    null
  )
  const [draft, setDraft] = useState<PolygonDraft>(createEmptyDraft)
  const [editor, setEditor] = useState<PolygonEditor>(createEmptyEditor)

  const {
    polygonsQuery,
    createPolygonMutation,
    updatePolygonMutation,
    deletePolygonMutation,
  } = usePolygonsQueries()

  const polygons = [...(polygonsQuery.data ?? [])].sort((left, right) => {
    const nameOrder = left.name.localeCompare(right.name)
    return nameOrder === 0 ? left.id - right.id : nameOrder
  })

  // If the selected polygon disappears after a refetch, clear the stale selection.
  const effectiveSelectedPolygonId =
    selectedPolygonId !== null &&
    polygons.some((polygon) => polygon.id === selectedPolygonId)
      ? selectedPolygonId
      : null

  const selectedPolygon =
    polygons.find((polygon) => polygon.id === effectiveSelectedPolygonId) ??
    null

  const draftValidation = polygonDraftSchema.safeParse(draft)
  const editorValidation = updatePolygonSchema.safeParse(editor)
  const hasSelectedPolygonChanges = getHasPolygonChanges(
    selectedPolygon,
    editor
  )

  function resetDraft() {
    setDraft(createEmptyDraft())
  }

  function addDraftPoint(point: PolygonPoint) {
    if (selectedPolygonId !== null) {
      // Clicking to start a new draft should move us out of edit mode immediately.
      startTransition(() => {
        setSelectedPolygonId(null)
      })
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      isDrawing: true,
      points: [...currentDraft.points, roundPoint(point)],
    }))
  }

  function completeDraftOutline() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      isDrawing: false,
    }))
  }

  function undoDraftPoint() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      points: currentDraft.points.slice(0, -1),
    }))
  }

  function selectPolygon(polygonId: number) {
    setDraft(createEmptyDraft())

    const polygon = polygons.find((item) => item.id === polygonId)

    if (polygon) {
      setEditor({
        name: polygon.name,
        color: polygon.color,
      })
    }

    startTransition(() => setSelectedPolygonId(polygonId))
  }

  function saveDraft() {
    if (!draftValidation.success || draft.points.length < 3) {
      toast.error("Add a name, choose a color, and place at least 3 points.")
      return
    }

    createPolygonMutation.mutate(
      {
        name: draftValidation.data.name,
        color: draftValidation.data.color,
        points: draft.points,
      },
      {
        onSuccess: (polygon) => {
          toast.success(`Saved ${polygon.name}.`)
          setDraft(createEmptyDraft())
          setEditor({
            name: polygon.name,
            color: polygon.color,
          })
          startTransition(() => {
            setSelectedPolygonId(polygon.id)
          })
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error))
        },
      }
    )
  }

  function savePolygonDetails() {
    if (!selectedPolygon) return

    if (!editorValidation.success)
      return toast.error("Use a valid name and hex color.")

    updatePolygonMutation.mutate(
      {
        id: selectedPolygon.id,
        input: editorValidation.data,
      },
      {
        onSuccess: (polygon) => {
          toast.success(`Updated ${polygon.name}.`)
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error))
        },
      }
    )
  }

  function deleteSelectedPolygon() {
    if (!selectedPolygon) return

    deletePolygonMutation.mutate(selectedPolygon.id, {
      onSuccess: () => {
        toast.success(`Deleted ${selectedPolygon.name}.`)
        setEditor(createEmptyEditor())
        startTransition(() => {
          setSelectedPolygonId(null)
        })
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })
  }

  return {
    draft,
    draftError:
      draftValidation.success || draft.name.length === 0
        ? null
        : (draftValidation.error.issues[0]?.message ?? "Use a valid draft."),
    editor,
    editorError:
      editorValidation.success || editor.name.length === 0
        ? null
        : (editorValidation.error.issues[0]?.message ??
          "Use valid polygon details."),
    isCreating: createPolygonMutation.isPending,
    isDeleting: deletePolygonMutation.isPending,
    isLoading: polygonsQuery.isLoading,
    isUpdating: updatePolygonMutation.isPending,
    polygons,
    selectedPolygon,
    selectedPolygonId: effectiveSelectedPolygonId,
    addDraftPoint,
    completeDraftOutline,
    deleteSelectedPolygon,
    hasSelectedPolygonChanges,
    resetDraft,
    saveDraft,
    savePolygonDetails,
    selectPolygon,
    setDraft,
    setEditor,
    undoDraftPoint,
  }
}

export type PolygonsManager = ReturnType<typeof usePolygonsManager>
