import { lazy, Suspense } from "react"
import { RemoteErrorBoundary } from "./RemoteErrorBoundary"

const MapPage = lazy(() => import("map_mfe/MapPage"))

export function MapRoute() {
  return (
    <RemoteErrorBoundary name="Map module">
      <Suspense
        fallback={
          <div className="text-muted-foreground px-8 py-10">
            Loading map module…
          </div>
        }
      >
        <MapPage />
      </Suspense>
    </RemoteErrorBoundary>
  )
}
