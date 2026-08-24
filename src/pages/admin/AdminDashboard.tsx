import { useUser } from "@clerk/react"
import { useQueries } from "@tanstack/react-query"
import { Building2, House, TrendingUp } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { fetchPropertyDetail } from "@/api/properties"
import { useProperties } from "@/hooks/useProperties"

function formatTodayLong(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())
}

type StatCardProps = {
  icon: ReactNode
  iconWrapClassName: string
  trend: string
  value: number | null
  label: string
  timeframe: string
  loading?: boolean
}

function StatCard({
  icon,
  iconWrapClassName,
  trend,
  value,
  label,
  timeframe,
  loading,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClassName}`}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {trend}
        </div>
      </div>
      <p className="mt-6 text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
        {loading || value === null ? (
          <span className="inline-block h-10 w-16 animate-pulse rounded-md bg-gray-100" />
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-base font-semibold text-gray-800">{label}</p>
      <p className="mt-2 text-sm text-gray-400">{timeframe}</p>
    </div>
  )
}

export function AdminDashboard() {
  const { user } = useUser()
  const displayName =
    user?.firstName ??
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    "there"

  const {
    data: properties,
    isLoading: propertiesLoading,
    isError: propertiesError,
  } = useProperties()
  const propertyIds = useMemo(
    () => properties?.map((p) => p.id) ?? [],
    [properties],
  )

  const detailQueries = useQueries({
    queries: propertyIds.map((id) => ({
      queryKey: ["property-detail", id],
      queryFn: () => fetchPropertyDetail(id),
      enabled: propertyIds.length > 0,
      staleTime: 60_000,
    })),
  })

  const totalProperties = properties?.length ?? null

  const roomsLoading =
    propertyIds.length > 0 &&
    detailQueries.some((q) => q.isPending || q.isFetching)

  const totalRooms =
    propertyIds.length === 0
      ? 0
      : roomsLoading
        ? null
        : detailQueries.reduce(
            (sum, q) => sum + (q.data?.rooms?.length ?? 0),
            0,
          )

  return (
    <div className="min-h-screen bg-gray-50 px-6 pt-28 pb-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Hello, {displayName}
        </h1>
        <p className="mt-2 text-base text-gray-500">{formatTodayLong()}</p>

        {propertiesError ? (
          <p className="mt-10 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            Could not load property stats. Check that the API is running.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <StatCard
              icon={<Building2 className="h-5 w-5 text-teal-600" />}
              iconWrapClassName="bg-teal-100"
              trend="+1"
              value={propertiesLoading ? null : totalProperties}
              label="Total Properties"
              timeframe="this quarter"
              loading={propertiesLoading}
            />
            <StatCard
              icon={<House className="h-5 w-5 text-purple-600" />}
              iconWrapClassName="bg-purple-100"
              trend="+4"
              value={totalRooms}
              label="Total Rooms"
              timeframe="from last month"
              loading={propertiesLoading || roomsLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
