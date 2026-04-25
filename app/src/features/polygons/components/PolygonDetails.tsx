import { CopyIcon, LoaderCircleIcon, RulerIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ColorField } from "@/components/misc/ColorField"
import type { PolygonsManager } from "@/features/polygons/hooks/usePolygonsManager"
import { formatPoint } from "../utils"

type PolygonDetailsProps = {
  manager: PolygonsManager
}

export function PolygonDetails({ manager }: PolygonDetailsProps) {
  const {
    deleteSelectedPolygon,
    draft,
    form,
    formError,
    hasSelectedPolygonChanges,
    isCreating,
    isDraftActive,
    isDeleting,
    isUpdating,
    resetDraft,
    saveDraft,
    savePolygonDetails,
    selectedPolygon,
    setForm,
  } = manager

  const activePoints = isDraftActive ? draft.points : (selectedPolygon?.points ?? [])
  const isBusy = isDeleting || isUpdating || isCreating

  const isDraftSaveDisabled = isCreating || draft.points.length < 3 || form.name.trim().length === 0

  const isPolygonSaveDisabled =
    isUpdating || !hasSelectedPolygonChanges || form.name.trim().length === 0 || Boolean(formError)

  const handleCopyCoordinates = async () => {
    const payload = activePoints.map((point, idx) => `${idx + 1}. ${formatPoint(point)}`).join("\n")

    await navigator.clipboard.writeText(payload)
    toast.success("Copied coordinates.")
  }

  return (
    <Card className="xl:col-span-3">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-heading text-xl">Details</CardTitle>
          {isDraftActive && <Badge variant="secondary">Draft</Badge>}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col">
        {!isDraftActive && !selectedPolygon ? (
          <Empty className="border border-dashed bg-muted/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RulerIcon />
              </EmptyMedia>
              <EmptyTitle>Select a polygon or click the board</EmptyTitle>
              <EmptyDescription>The current draft or selected polygon will show its details here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-1 animate-in flex-col gap-5 overflow-y-scroll duration-300 fade-in-0">
            <FieldGroup>
              <Field data-invalid={Boolean(formError) || undefined}>
                <FieldLabel htmlFor="polygon-form-name">Polygon name</FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={Boolean(formError)}
                    id="polygon-form-name"
                    disabled={isBusy}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        name: event.target.value,
                      }))
                    }
                    placeholder={isDraftActive ? "e.g. Triangle" : undefined}
                    value={form.name}
                  />
                  {isDraftActive && (
                    <FieldDescription>Add at least 3 points, then save the draft.</FieldDescription>
                  )}
                  <FieldError>{formError}</FieldError>
                </FieldContent>
              </Field>

              <ColorField
                color={form.color}
                id="polygon-form-color"
                label="Polygon color"
                disabled={isBusy}
                onChange={(color) => setForm((currentForm) => ({ ...currentForm, color }))}
              />
            </FieldGroup>

            {activePoints.length > 0 && (
              <div className="animate-in rounded-xl border duration-300 fade-in-0 zoom-in-[0.99]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="font-medium">Coordinates ({activePoints.length})</div>

                  <Button
                    disabled={activePoints.length === 0}
                    onClick={handleCopyCoordinates}
                    size="sm"
                    variant="outline"
                  >
                    <CopyIcon />
                    Copy
                  </Button>
                </div>

                <div className="flex flex-col gap-2 p-4">
                  {activePoints.map((point, index) => (
                    <div
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                      key={`${point[0]}-${point[1]}-${index}`}
                    >
                      <span className="font-medium">P{index + 1}</span>
                      <span className="text-right wrap-break-word text-muted-foreground">{formatPoint(point)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {(isDraftActive || selectedPolygon) && (
        <CardFooter className="mt-auto flex-col gap-3 border-t bg-card">
          {isDraftActive ? (
            <div className="flex w-full flex-col gap-2">
              <Button className="w-full" disabled={isDraftSaveDisabled} onClick={saveDraft}>
                {isCreating ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
                {isCreating ? "Saving..." : "Save polygon"}
              </Button>

              <Button className="w-full" disabled={isCreating} onClick={resetDraft} variant="outline">
                Reset draft
              </Button>
            </div>
          ) : (
            selectedPolygon && (
              <div className="flex w-full flex-col gap-2">
                <Button className="w-full" disabled={isPolygonSaveDisabled || isDeleting} onClick={savePolygonDetails}>
                  {isUpdating ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>

                <Button
                  className="w-full"
                  disabled={isDeleting || isUpdating}
                  onClick={deleteSelectedPolygon}
                  variant="destructive"
                >
                  {isDeleting ? <LoaderCircleIcon className="animate-spin" /> : <Trash2Icon />}
                  {isDeleting ? "Deleting..." : "Delete polygon"}
                </Button>
              </div>
            )
          )}
        </CardFooter>
      )}
    </Card>
  )
}
