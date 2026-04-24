import { PencilLineIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PolygonCanvas } from "@/features/polygons/components/PolygonCanvas"
import { PolygonDetails } from "@/features/polygons/components/PolygonDetails"
import { PolygonList } from "@/features/polygons/components/PolygonList"
import { usePolygonsManager } from "@/features/polygons/hooks/usePolygonsManager"

export function Polygons() {
  const manager = usePolygonsManager()

  return (
    <main className="flex flex-1 animate-in flex-col gap-4 duration-500 fade-in-0 slide-in-from-bottom-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/15 transition-transform duration-300 hover:-translate-y-0.5">
                <PencilLineIcon />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-3xl">
                  Polygon Manager
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Draw, save, recolor, and manage polygons on the canvas.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid flex-1 gap-4 overflow-hidden xl:grid-cols-12">
        <PolygonList manager={manager} />

        <Card className="xl:col-span-6">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-heading text-xl">Canvas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click the board to start a polygon. Click a saved shape to
                  inspect it.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1">
            <PolygonCanvas manager={manager} />
          </CardContent>
        </Card>

        <PolygonDetails manager={manager} />
      </section>
    </main>
  )
}
