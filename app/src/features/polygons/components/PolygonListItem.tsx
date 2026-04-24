import { cn } from "@/utils/cn"
import { getPolygonStyle, pointsToMiniPath } from "../utils"
import type { Polygon } from "@/types/polygon"
import type { FC } from "react"

type PolygonListItemProps = {
  isActive: boolean
  polygon: Polygon
  selectPolygon: (polygonId: number) => void
}

export const PolygonListItem: FC<PolygonListItemProps> = ({
  isActive,
  polygon,
  selectPolygon,
}) => {
  const polygonStyle = getPolygonStyle(polygon.color)

  return (
    <button
      className={cn(
        "w-full rounded-lg border bg-background text-left transition-all",
        isActive
          ? "border-primary/70 shadow-sm"
          : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
      )}
      onClick={() => selectPolygon(polygon.id)}
      type="button"
    >
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
        <div className="flex items-center justify-center rounded-md bg-muted/70 p-1.5">
          <svg className="size-9" fill="none" viewBox="0 0 64 64">
            <path
              d={`${pointsToMiniPath(polygon.points)} Z`}
              fill={polygonStyle.fill}
              stroke={polygonStyle.stroke}
              strokeWidth="1.7"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: polygon.color }}
            />

            <div className="truncate text-sm font-medium text-foreground">
              {polygon.name}
            </div>
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {polygon.points.length} points
          </p>
        </div>
      </div>
    </button>
  )
}
