import { useState } from "react"
import { toast } from "sonner"

import type { PolygonDraft, PolygonPoint } from "@/types/polygon"
import { polygonFormSchema, type PolygonForm } from "@/schemas/polygons"
import { getApiErrorMessage } from "@/utils/getApiErrorMessage"
import { DEFAULT_POLYGON_COLOR } from "../constants"
import { roundPoint } from "../utils"
import { usePolygonsQueries } from "./usePolygonsQueries"

function createEmptyDraft(): PolygonDraft {
  return {
    isDrawing: false,
    points: [],
  }
}

function createEmptyForm(): PolygonForm {
  return {
    name: "",
    color: DEFAULT_POLYGON_COLOR,
  }
}

function normalizePolygonFormValue(value: PolygonForm) {
  return {
    name: value.name.trim(),
    color: value.color.trim().toUpperCase(),
  }
}

function getHasPolygonChanges(polygon: { name: string; color: string } | null, form: PolygonForm) {
  if (!polygon) return false

  // Compare normalized values so stuff like whitespace and such are trimmed
  const normalizedForm = normalizePolygonFormValue(form)
  const normalizedPolygon = normalizePolygonFormValue(polygon)

  return normalizedForm.name !== normalizedPolygon.name || normalizedForm.color !== normalizedPolygon.color
}

export function usePolygonsManager() {
  const [selectedPolygonId, setSelectedPolygonId] = useState<number | null>(null)
  const [draft, setDraft] = useState<PolygonDraft>(createEmptyDraft)
  const [form, setForm] = useState<PolygonForm>(createEmptyForm)

  const { polygonsQuery, createPolygonMutation, updatePolygonMutation, deletePolygonMutation } = usePolygonsQueries()

  const { data: polygons = [] } = polygonsQuery

  const selectedPolygon = polygons.find((polygon) => polygon.id === selectedPolygonId) ?? null
  const isDraftActive = draft.points.length > 0 || draft.isDrawing

  const formValidation = polygonFormSchema.safeParse(form)
  const hasSelectedPolygonChanges = getHasPolygonChanges(selectedPolygon, form)

  function resetDraft() {
    setDraft(createEmptyDraft())
    setForm(createEmptyForm())
  }

  function addDraftPoint(point: PolygonPoint) {
    if (selectedPolygonId !== null) {
      // Clicking to start a new draft will move us out of edit mode.
      setSelectedPolygonId(null)
      setForm(createEmptyForm())
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      isDrawing: true,
      points: [...currentDraft.points, roundPoint(point)],
    }))
  }

  function completeDraftOutline() {
    setDraft((currentDraft) => ({ ...currentDraft, isDrawing: false }))
  }

  function undoDraftPoint() {
    setDraft((currentDraft) => ({ ...currentDraft, points: currentDraft.points.slice(0, -1) }))
  }

  function selectPolygon(polygonId: number) {
    // If any draft is currently created, when selecting a polygon, reset it.
    if (draft.points.length) {
      setDraft(createEmptyDraft())
    }

    const polygon = polygons.find((item) => item.id === polygonId)
    if (!polygon) return

    const isTheSame = polygon.id === selectedPolygonId

    setForm(isTheSame ? createEmptyForm() : { name: polygon.name, color: polygon.color })
    setSelectedPolygonId(isTheSame ? null : polygon.id)
  }

  function saveDraft() {
    if (!formValidation.success || draft.points.length < 3) {
      toast.error("Add a name and place at least 3 points.")
      return
    }

    createPolygonMutation.mutate(
      {
        name: formValidation.data.name,
        color: formValidation.data.color,
        points: draft.points,
      },
      {
        onSuccess: (polygon) => {
          toast.success(`Created ${polygon.name}.`)
          setDraft(createEmptyDraft())
          setForm({
            name: polygon.name,
            color: polygon.color,
          })
          setSelectedPolygonId(polygon.id)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    )
  }

  function savePolygonDetails() {
    if (!selectedPolygon) return

    if (!formValidation.success) {
      return toast.error("Use a valid name and hex color.")
    }

    updatePolygonMutation.mutate(
      {
        id: selectedPolygon.id,
        input: formValidation.data,
      },
      {
        onSuccess: (polygon) => toast.success(`Updated ${polygon.name}.`),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    )
  }

  function deleteSelectedPolygon() {
    if (!selectedPolygon) return

    deletePolygonMutation.mutate(selectedPolygon.id, {
      onSuccess: () => {
        toast.success(`Deleted ${selectedPolygon.name}.`)
        setForm(createEmptyForm())
        setSelectedPolygonId(null)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return {
    draft,
    form,
    formError:
      formValidation.success || form.name.length === 0
        ? null
        : (formValidation.error.issues[0]?.message ?? "Use valid polygon details."),
    hasSelectedPolygonChanges,
    isCreating: createPolygonMutation.isPending,
    isDraftActive,
    isDeleting: deletePolygonMutation.isPending,
    isLoading: polygonsQuery.isLoading,
    isUpdating: updatePolygonMutation.isPending,
    polygons,
    selectedPolygon,
    selectedPolygonId: selectedPolygon?.id ?? null,
    addDraftPoint,
    completeDraftOutline,
    deleteSelectedPolygon,
    resetDraft,
    saveDraft,
    savePolygonDetails,
    selectPolygon,
    setDraft,
    setForm,
    undoDraftPoint,
  }
}

export type PolygonsManager = ReturnType<typeof usePolygonsManager>
