import {
  LoaderCircleIcon,
  MinusIcon,
  MousePointerClickIcon,
  PlusIcon,
  RotateCcwIcon,
  Undo2Icon,
} from "lucide-react"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react"

import {
  DEFAULT_POLYGON_COLOR,
  POLYGON_IMAGE_SIZE,
  POLYGON_IMAGE_URL,
} from "../constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PolygonsManager } from "@/features/polygons/hooks/usePolygonsManager"
import { cn } from "@/utils/cn"
import type { Polygon, PolygonPoint } from "@/types/polygon"
import { findPolygonAtPoint, getPolygonStyle } from "../utils"

type PolygonCanvasProps = {
  manager: PolygonsManager
}

type StageSize = {
  width: number
  height: number
}

const EMPTY_STAGE_SIZE: StageSize = {
  width: 0,
  height: 0,
}

function getImagePoint(event: MouseEvent<HTMLCanvasElement>): PolygonPoint {
  const bounds = event.currentTarget.getBoundingClientRect()
  const scaleX = POLYGON_IMAGE_SIZE.width / bounds.width
  const scaleY = POLYGON_IMAGE_SIZE.height / bounds.height

  // Clicks happen in the rendered canvas space, but polygon data lives in image coords.
  return [
    Number(((event.clientX - bounds.left) * scaleX).toFixed(1)),
    Number(((event.clientY - bounds.top) * scaleY).toFixed(1)),
  ]
}

export function PolygonCanvas({ manager }: PolygonCanvasProps) {
  const {
    addDraftPoint,
    completeDraftOutline,
    draft,
    isCreating,
    isDeleting,
    isUpdating,
    polygons,
    resetDraft,
    selectPolygon,
    selectedPolygonId,
    undoDraftPoint,
    isLoading,
  } = manager

  const [stageSize, setStageSize] = useState<StageSize>(EMPTY_STAGE_SIZE)
  const [hoverPoint, setHoverPoint] = useState<PolygonPoint | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const isBusy = isCreating || isDeleting || isUpdating || isLoading

  useLayoutEffect(() => {
    // We measure here before paint so the canvas can size itself without a visible jump.
    const stageElement = stageRef.current
    if (!stageElement) return undefined

    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(stageElement)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Canvas pixels do not react to state changes on their own, so we repaint whenever
    // the stage size or the polygon/draft state changes.
    const canvas = canvasRef.current

    if (!canvas || stageSize.width === 0 || stageSize.height === 0) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) return

    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = stageSize.width * devicePixelRatio
    canvas.height = stageSize.height * devicePixelRatio
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    context.clearRect(0, 0, stageSize.width, stageSize.height)

    for (const polygon of polygons) {
      drawPolygon({
        context,
        hasActiveSelection: selectedPolygonId !== null,
        polygon,
        stageSize,
        isSelected: polygon.id === selectedPolygonId,
      })
    }

    if (draft.points.length > 0) {
      drawDraft({
        color: draft.color || DEFAULT_POLYGON_COLOR,
        context,
        hoverPoint,
        points: draft.points,
        stageSize,
      })
    }
  }, [
    draft.color,
    draft.points,
    hoverPoint,
    polygons,
    selectedPolygonId,
    stageSize,
  ])

  function handleCanvasClick(event: MouseEvent<HTMLCanvasElement>) {
    if (isBusy) return

    const point = getImagePoint(event)

    if (draft.points.length > 0) {
      if (shouldSnapToFirstPoint(draft.points, point)) {
        completeDraftOutline()
        return
      }

      addDraftPoint(point)
      return
    }

    const polygon = findPolygonAtPoint(polygons, point)

    if (polygon) {
      selectPolygon(polygon.id)
      return
    }

    addDraftPoint(point)
  }

  function handleCanvasMove(event: MouseEvent<HTMLCanvasElement>) {
    if (isBusy || !draft.isDrawing) return

    const point = getImagePoint(event)
    setHoverPoint(
      shouldSnapToFirstPoint(draft.points, point) ? draft.points[0] : point
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-2">
        <Button
          disabled={isBusy || draft.points.length === 0}
          onClick={undoDraftPoint}
          variant="outline"
        >
          <Undo2Icon />
          Undo point
        </Button>

        <Button
          disabled={isBusy || draft.points.length === 0}
          onClick={resetDraft}
          variant="outline"
        >
          <RotateCcwIcon />
          Reset draft
        </Button>

        <div className="flex w-full items-center justify-end gap-2 sm:ml-auto sm:w-auto">
          <Button
            disabled={isBusy || zoomLevel <= 1}
            onClick={() =>
              setZoomLevel((value) =>
                Math.max(1, Number((value - 0.1).toFixed(1)))
              )
            }
            size="icon"
            variant="outline"
          >
            <MinusIcon />
          </Button>

          <Badge variant="outline">{Math.round(zoomLevel * 100)}%</Badge>

          <Button
            disabled={isBusy || zoomLevel >= 1.6}
            onClick={() =>
              setZoomLevel((value) =>
                Math.min(1.6, Number((value + 0.1).toFixed(1)))
              )
            }
            size="icon"
            variant="outline"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border bg-muted/50">
        <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex flex-wrap items-center gap-2">
          <Badge>
            <MousePointerClickIcon />
            {draft.points.length > 0
              ? "Keep clicking to shape the polygon"
              : "Click the board to draw or a shape to inspect"}
          </Badge>

          {isBusy && (
            <Badge variant="secondary">
              <LoaderCircleIcon className="animate-spin" />
              Updating canvas
            </Badge>
          )}
        </div>

        <div
          className="relative size-full origin-center transition-transform duration-200"
          ref={stageRef}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            alt="Canvas background"
            className="absolute inset-0 size-full object-cover"
            height={POLYGON_IMAGE_SIZE.height}
            width={POLYGON_IMAGE_SIZE.width}
            src={POLYGON_IMAGE_URL}
          />
          <canvas
            className={cn(
              "absolute inset-0 size-full",
              isBusy
                ? "pointer-events-none cursor-not-allowed"
                : draft.points.length > 0
                  ? "cursor-crosshair"
                  : "cursor-pointer"
            )}
            onClick={handleCanvasClick}
            onMouseLeave={() => setHoverPoint(null)}
            onMouseMove={handleCanvasMove}
            ref={canvasRef}
          />

          {isBusy && (
            <div className="absolute inset-0 z-10 animate-in bg-background/30 fade-in-10" />
          )}
        </div>
      </div>
    </div>
  )
}

function shouldSnapToFirstPoint(points: PolygonPoint[], point: PolygonPoint) {
  if (points.length < 3) return false

  const [firstX, firstY] = points[0]
  const deltaX = firstX - point[0]
  const deltaY = firstY - point[1]

  // Give the user a forgiving target when closing the shape.
  return Math.hypot(deltaX, deltaY) <= 24
}

function scalePoint(point: PolygonPoint, stageSize: StageSize): PolygonPoint {
  // Inverse of getImagePoint basically, so redraws still line up after resize/zoom.
  return [
    (point[0] / POLYGON_IMAGE_SIZE.width) * stageSize.width,
    (point[1] / POLYGON_IMAGE_SIZE.height) * stageSize.height,
  ]
}

function drawPolygon({
  context,
  hasActiveSelection,
  polygon,
  stageSize,
  isSelected,
}: {
  context: CanvasRenderingContext2D
  hasActiveSelection: boolean
  isSelected: boolean
  polygon: Polygon
  stageSize: StageSize
}) {
  const scaledPoints = polygon.points.map((point) =>
    scalePoint(point, stageSize)
  )
  const polygonStyle = getPolygonStyle(polygon.color)

  if (scaledPoints.length < 2) return

  context.save()
  context.beginPath()
  context.moveTo(scaledPoints[0][0], scaledPoints[0][1])

  for (const [x, y] of scaledPoints.slice(1)) {
    context.lineTo(x, y)
  }

  context.closePath()
  context.fillStyle = polygonStyle.fill
  context.strokeStyle = polygonStyle.stroke
  context.lineWidth = isSelected ? 2.4 : 1.6
  context.lineJoin = "round"
  context.lineCap = "round"
  context.shadowBlur = isSelected ? 10 : 0
  context.shadowColor = polygonStyle.halo
  context.globalAlpha = isSelected || !hasActiveSelection ? 1 : 0.58
  context.fill()
  context.stroke()
  context.restore()

  if (isSelected) {
    // Extra pass just for the selected polygon glow, keeps the normal stroke cleaner.
    context.save()
    context.beginPath()
    context.moveTo(scaledPoints[0][0], scaledPoints[0][1])

    for (const [x, y] of scaledPoints.slice(1)) {
      context.lineTo(x, y)
    }

    context.closePath()
    context.strokeStyle = polygonStyle.halo
    context.lineWidth = 7
    context.lineJoin = "round"
    context.lineCap = "round"
    context.stroke()
    context.restore()
  }

  for (const [x, y] of scaledPoints) {
    context.save()
    context.beginPath()
    context.fillStyle = "#FFFFFF"
    context.strokeStyle = polygonStyle.stroke
    context.lineWidth = 1.25
    context.globalAlpha = isSelected || !hasActiveSelection ? 0.95 : 0.6
    context.arc(x, y, isSelected ? 4.25 : 3.25, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.restore()
  }
}

function drawDraft({
  color,
  context,
  hoverPoint,
  points,
  stageSize,
}: {
  color: string
  context: CanvasRenderingContext2D
  hoverPoint: PolygonPoint | null
  points: PolygonPoint[]
  stageSize: StageSize
}) {
  const scaledPoints = points.map((point) => scalePoint(point, stageSize))
  const scaledHoverPoint = hoverPoint ? scalePoint(hoverPoint, stageSize) : null
  const polygonStyle = getPolygonStyle(color)

  if (scaledPoints.length === 0) {
    return
  }

  const canClose = scaledPoints.length >= 3
  const firstPoint = scaledPoints[0]
  const lastPoint = scaledPoints.at(-1) ?? firstPoint

  // If hover snaps back to point zero we switch the preview into close mode.
  const isHoveringCloseTarget =
    hoverPoint !== null &&
    hoverPoint[0] === points[0]?.[0] &&
    hoverPoint[1] === points[0]?.[1]

  context.save()
  if (canClose) {
    context.beginPath()
    context.moveTo(firstPoint[0], firstPoint[1])

    for (const [x, y] of scaledPoints.slice(1)) {
      context.lineTo(x, y)
    }

    context.closePath()
    context.fillStyle = polygonStyle.draftFill
    context.fill()
  }

  context.beginPath()
  context.setLineDash([8, 6])
  context.moveTo(scaledPoints[0][0], scaledPoints[0][1])

  for (const [x, y] of scaledPoints.slice(1)) {
    context.lineTo(x, y)
  }

  if (scaledHoverPoint) {
    context.lineTo(scaledHoverPoint[0], scaledHoverPoint[1])
  }

  context.strokeStyle = polygonStyle.stroke
  context.lineWidth = 2
  context.lineJoin = "round"
  context.lineCap = "round"
  context.shadowBlur = 8
  context.shadowColor = polygonStyle.draftHalo
  context.stroke()

  if (canClose) {
    context.beginPath()
    context.setLineDash([3, 7])
    context.moveTo(lastPoint[0], lastPoint[1])
    context.lineTo(firstPoint[0], firstPoint[1])
    context.strokeStyle = polygonStyle.halo
    context.lineWidth = 1.25
    context.stroke()
  }

  if (scaledHoverPoint && canClose) {
    // This last guide line helps show whether the next click will add a point or finish it.
    context.beginPath()
    context.setLineDash(isHoveringCloseTarget ? [2, 4] : [3, 7])
    context.moveTo(scaledHoverPoint[0], scaledHoverPoint[1])
    context.lineTo(firstPoint[0], firstPoint[1])
    context.strokeStyle = isHoveringCloseTarget
      ? polygonStyle.stroke
      : polygonStyle.halo
    context.lineWidth = isHoveringCloseTarget ? 2 : 1.25
    context.stroke()
  }

  context.restore()

  for (const [index, [x, y]] of scaledPoints.entries()) {
    context.save()
    context.beginPath()
    context.fillStyle = "#FFFFFF"
    context.strokeStyle = index === 0 ? polygonStyle.stroke : "#FFFFFF"
    context.lineWidth = index === 0 ? 2.5 : 0
    context.shadowBlur = index === 0 ? 10 : 0
    context.shadowColor = polygonStyle.draftHalo
    context.arc(
      x,
      y,
      index === 0 && isHoveringCloseTarget ? 6.5 : index === 0 ? 5 : 3.5,
      0,
      Math.PI * 2
    )
    context.fill()
    if (index === 0) {
      context.stroke()
    }
    context.restore()
  }

  if (scaledHoverPoint) {
    context.save()
    context.beginPath()
    context.fillStyle = polygonStyle.stroke
    context.globalAlpha = 0.16
    context.arc(scaledHoverPoint[0], scaledHoverPoint[1], 5, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}
