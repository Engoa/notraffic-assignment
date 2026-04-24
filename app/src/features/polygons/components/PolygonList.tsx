import { Layers3Icon, LoaderCircleIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { PolygonsManager } from "@/features/polygons/hooks/usePolygonsManager"
import { PolygonListItem } from "./PolygonListItem"

type PolygonListProps = {
  manager: PolygonsManager
}

export function PolygonList({ manager }: PolygonListProps) {
  const { isLoading, polygons, selectPolygon, selectedPolygonId } = manager

  return (
    <Card className="xl:col-span-3">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="font-heading text-xl">Polygons</CardTitle>
            <Badge variant="secondary">{polygons.length}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-scroll">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="animate-spin" />
            Loading polygons...
          </div>
        ) : polygons.length === 0 ? (
          <Empty className="border border-dashed bg-muted/40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers3Icon />
              </EmptyMedia>
              <EmptyTitle>No polygons yet</EmptyTitle>
              <EmptyDescription>
                Start drawing on the canvas and the first saved polygon will
                appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {polygons.map((polygon) => {
              const isActive = polygon.id === selectedPolygonId

              return (
                <PolygonListItem
                  key={polygon.id}
                  isActive={isActive}
                  polygon={polygon}
                  selectPolygon={selectPolygon}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
