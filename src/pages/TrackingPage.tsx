import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import { useEmployeeJourney, useLiveLocations } from "@/features/tracking/hooks";
import { getAllEmployees } from "@/features/adminEmployee/services/adminEmployee.service";
import { formatDateTime } from "@/lib/format";
import type { Employee } from "@/types/domain";

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => { if (points.length > 1) map.fitBounds(points, { padding: [30, 30] }); }, [map, points]);
  return null;
}

export default function TrackingPage() {
  const locations = useLiveLocations();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  useEffect(() => { void getAllEmployees().then(setEmployees); }, []);
  const selected = employees.find((employee) => employee.id === employeeId);
  const journey = useEmployeeJourney(employeeId);
  const points = useMemo(() => (journey.data ?? []).map((point) => [point.latitude, point.longitude] as [number, number]), [journey.data]);
  const totalKm = journey.data?.length ? journey.data[journey.data.length - 1].cumulative_km : 0;
  const live = locations.data?.find((location) => location.employee_id === employeeId);
  const center = live ? [live.latitude, live.longitude] as [number, number] : points[points.length - 1] ?? [20.5937, 78.9629] as [number, number];

  return <div className="space-y-5 p-5 lg:p-6">
    <PageHeader eyebrow="Field visibility" title="Live Employee Tracking" description="Live GPS movement during an active work session. Location updates are received automatically from the native employee app." />
    <EmployeePicker employees={employees} selectedId={employeeId} onSelect={(employee) => setEmployeeId(employee.id)} title="Select Employee" description="Select an employee to see today's live position and complete journey." />
    {!employeeId ? <EmptyState title="Select an employee" description="Choose an employee above to open their live journey." /> : <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <Card className="overflow-hidden"><CardHeader><div className="flex items-center justify-between"><div><h2 className="font-semibold">{selected?.full_name ?? "Employee"} — Live Journey</h2><p className="text-sm text-slate-500">{live?.is_working ? "● Working now" : "○ Not currently working"}</p></div><div className="text-right"><p className="text-xs text-slate-500">Today's distance</p><p className="text-2xl font-bold">{totalKm.toFixed(2)} km</p></div></div></CardHeader><CardContent className="p-0">{journey.isLoading ? <Skeleton className="h-[600px] rounded-none" /> : journey.isError ? <div className="flex h-[600px] items-center justify-center p-6 text-center"><div><p className="font-semibold">Unable to load this employee's journey</p><p className="mt-1 text-sm text-slate-500">{journey.error instanceof Error ? journey.error.message : "Please try again."}</p></div></div> : <MapContainer center={center} className="h-[600px] w-full" zoom={12}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{points.length > 1 ? <><Polyline positions={points} /><FitRoute points={points} /></> : null}{points.map((point, index) => <CircleMarker key={`${point[0]}-${point[1]}-${index}`} center={point} radius={index === points.length - 1 ? 10 : 5} pathOptions={{ color: index === points.length - 1 ? "#dc2626" : "#2563eb" }}><Popup><div className="text-sm"><strong>{journey.data?.[index]?.address || `Location ${index + 1}`}</strong><br />{formatDateTime(journey.data?.[index]?.recorded_at ?? "")}<br />Segment: {journey.data?.[index]?.distance_from_previous_km.toFixed(2)} km</div></Popup></CircleMarker>)}</MapContainer>}</CardContent></Card>
      <div className="space-y-5"><Card><CardHeader><h2 className="font-semibold">Journey Flow</h2></CardHeader><CardContent>{journey.data?.length ? <div className="space-y-3">{journey.data.map((point,index)=><div key={point.id} className="relative pl-7"><span className="absolute left-1 top-1.5 size-3 rounded-full bg-slate-700" />{index < journey.data!.length-1 ? <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" /> : null}<p className="font-semibold">{point.address || `GPS ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`}</p><p className="text-xs text-slate-500">{formatDateTime(point.recorded_at)}</p>{point.distance_from_previous_km > 0 ? <p className="text-sm font-medium">+{point.distance_from_previous_km.toFixed(2)} km</p> : <p className="text-sm text-slate-500">Starting point</p>}</div>)}</div> : <EmptyState title="No journey points yet" description="Tracking begins when the employee starts today's work session." />}</CardContent></Card><Card><CardHeader><h2 className="font-semibold">Live status</h2></CardHeader><CardContent className="space-y-2 text-sm"> <p>Employee: <strong>{selected?.full_name}</strong></p><p>Current status: <strong>{live?.is_working ? "Working" : "Not working"}</strong></p><p>Last update: <strong>{live ? formatDateTime(live.updated_at) : "—"}</strong></p><p>Battery: <strong>{live?.battery_percent != null ? `${live.battery_percent}%` : "Unavailable"}</strong></p><p>Points today: <strong>{journey.data?.length ?? 0}</strong></p><p>Total travelled: <strong>{totalKm.toFixed(2)} km</strong></p></CardContent></Card></div>
    </div>}
  </div>;
}
