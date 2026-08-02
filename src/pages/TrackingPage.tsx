import "leaflet/dist/leaflet.css";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveLocations } from "@/features/tracking/hooks";
import { formatDateTime } from "@/lib/format";

export default function TrackingPage() {
  const locations = useLiveLocations();
  const center = locations.data?.[0] ? [locations.data[0].latitude, locations.data[0].longitude] as [number, number] : [20.5937, 78.9629] as [number, number];

  return (
    <div>
      <PageHeader
        description="OpenStreetMap live view of employee markers, latest locations, battery status, and working state."
        eyebrow="Field visibility"
        title="Live Tracking"
      />
      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950">Employee map</h2>
          </CardHeader>
          <CardContent className="p-0">
            {locations.isLoading ? (
              <Skeleton className="h-[620px] rounded-none" />
            ) : locations.data && locations.data.length > 0 ? (
              <MapContainer center={center} className="h-[620px] w-full" zoom={5}>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {locations.data.map((location) => (
                  <CircleMarker center={[location.latitude, location.longitude]} fillColor="#2563eb" fillOpacity={0.85} key={location.id} pathOptions={{ color: "#1e40af" }} radius={9}>
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">{location.employee_name}</p>
                        <p>Employee ID: {location.employee_number}</p>
                        <p>Branch: {location.branch}</p>
                        <p>Updated {formatDateTime(location.updated_at)}</p>
                        <p>Battery: {location.battery_percent !== null ? `${location.battery_percent}%` : "Unavailable"}</p>
                        <p>Status: {location.is_working ? "Working" : "Not Working"}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : (
              <div className="p-5">
                <EmptyState description="Employee location pings will appear here when the mobile app sends tracking data." title="No live locations" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-950">Active employees</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(locations.data ?? []).map((location) => (
                <div className="rounded-xl border border-slate-200 p-3" key={location.id}>
                  <p className="font-semibold text-slate-950">{location.employee_name}</p>
                  <p className="text-sm text-slate-500">{location.employee_number} • {location.branch}</p>
                  <p className="text-sm text-slate-500">{formatDateTime(location.updated_at)}</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">Battery: {location.battery_percent !== null ? `${location.battery_percent}%` : "Unavailable"}</p>
                  <p className="text-sm font-medium text-slate-700">Status: {location.is_working ? "Working" : "Not Working"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
