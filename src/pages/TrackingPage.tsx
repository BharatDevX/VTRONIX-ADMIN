import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import { getAllEmployees } from "@/features/adminEmployee/services/adminEmployee.service";
import { useEmployeeJourney, useEmployeeTrackingSummary, useLiveLocations } from "@/features/tracking/hooks";
import { getEmployeeTrackingPdfData } from "@/features/tracking/service";
import { renderEmployeeTrackingPdf } from "@/services/export.service";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { Employee } from "@/types/domain";

function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [map, points]);

  return null;
}

function formatKm(value: number) {
  return `${value.toFixed(2)} km`;
}

export default function TrackingPage() {
  const locations = useLiveLocations();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    void getAllEmployees().then(setEmployees);
  }, []);

  const selected = employees.find((employee) => employee.id === employeeId);
  const journey = useEmployeeJourney(employeeId);
  const summary = useEmployeeTrackingSummary(employeeId);

  const checkpointPoints = useMemo(
    () => (journey.data ?? []).map((point) => [point.latitude, point.longitude] as [number, number]),
    [journey.data],
  );

  const live = locations.data?.find((location) => location.employee_id === employeeId);
  const livePoint = live ? [live.latitude, live.longitude] as [number, number] : null;

  const mapPoints = useMemo(() => {
    if (!livePoint) return checkpointPoints;
    if (!checkpointPoints.length) return [livePoint];
    const last = checkpointPoints[checkpointPoints.length - 1];
    const samePoint = Math.abs(last[0] - livePoint[0]) < 0.00001 && Math.abs(last[1] - livePoint[1]) < 0.00001;
    return samePoint ? checkpointPoints : [...checkpointPoints, livePoint];
  }, [checkpointPoints, livePoint]);

  const center = mapPoints[mapPoints.length - 1] ?? [20.5937, 78.9629] as [number, number];
  const totalKm = summary.data?.todayKm ?? journey.data?.[journey.data.length - 1]?.cumulative_km ?? 0;

  const generateTrackingPdf = async () => {
    if (!employeeId) return;

    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) {
      setPdfError("Please allow pop-ups in your browser to generate the PDF.");
      return;
    }

    setPdfLoading(true);
    setPdfError(null);
    popup.document.write("<p style=\"font-family:Arial;padding:24px\">Preparing live tracking PDF...</p>");

    try {
      const data = await getEmployeeTrackingPdfData(employeeId);
      renderEmployeeTrackingPdf(popup, data);
    } catch (error) {
      popup.close();
      setPdfError(error instanceof Error ? error.message : "Unable to generate live tracking PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <PageHeader
        eyebrow="Field visibility"
        title="Live Employee Tracking"
        description="Live GPS position updates continuously during an active work session. Journey checkpoints are recorded approximately every 5 km and the final location is captured when End Work is completed."
        actions={employeeId ? (
          <Button variant="outline" disabled={pdfLoading} onClick={() => void generateTrackingPdf()}>
            {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {pdfLoading ? "Preparing..." : "Generate PDF"}
          </Button>
        ) : undefined}
      />
      {pdfError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{pdfError}</div>
      ) : null}

      <EmployeePicker
        employees={employees}
        selectedId={employeeId}
        onSelect={(employee) => setEmployeeId(employee.id)}
        title="Select Employee"
        description="Select an employee to see their live position, today's checkpoints, vehicle type and distance totals."
      />

      {!employeeId ? (
        <EmptyState title="Select an employee" description="Choose an employee above to open their live journey." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{selected?.full_name ?? "Employee"} — Live Journey</h2>
                  <p className="text-sm text-slate-500">
                    {live?.is_working ? "● Working now · live position connected" : "○ Not currently working"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Today's distance</p>
                  <p className="text-2xl font-bold">{formatKm(totalKm)}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {journey.isLoading ? (
                <Skeleton className="h-[600px] rounded-none" />
              ) : journey.isError ? (
                <div className="flex h-[600px] items-center justify-center p-6 text-center">
                  <div>
                    <p className="font-semibold">Unable to load this employee's journey</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {journey.error instanceof Error ? journey.error.message : "Please try again."}
                    </p>
                  </div>
                </div>
              ) : (
                <MapContainer center={center} className="h-[600px] w-full" zoom={12}>
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {checkpointPoints.length > 1 ? (
                    <Polyline positions={checkpointPoints} pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.8 }} />
                  ) : null}

                  {livePoint && checkpointPoints.length > 0 ? (
                    <Polyline
                      positions={[checkpointPoints[checkpointPoints.length - 1], livePoint]}
                      pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.75, dashArray: "8 8" }}
                    />
                  ) : null}

                  <FitRoute points={mapPoints} />

                  {checkpointPoints.map((point, index) => {
                    const journeyPoint = journey.data?.[index];
                    const isLastCheckpoint = index === checkpointPoints.length - 1;

                    return (
                      <CircleMarker
                        key={`${point[0]}-${point[1]}-${index}`}
                        center={point}
                        radius={isLastCheckpoint ? 9 : 5}
                        pathOptions={{
                          color: isLastCheckpoint ? "#dc2626" : "#2563eb",
                          fillOpacity: 1,
                        }}
                      >
                        <Popup>
                          <div className="text-sm leading-5">
                            <strong>{journeyPoint?.address || `Checkpoint ${index + 1}`}</strong>
                            <br />
                            {formatDateTime(journeyPoint?.recorded_at ?? "")}
                            <br />
                            {journeyPoint && journeyPoint.distance_from_previous_km > 0
                              ? `Segment: ${journeyPoint.distance_from_previous_km.toFixed(2)} km`
                              : "Starting point"}
                            <br />
                            <span className="text-slate-500">Checkpoint {index + 1}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {livePoint ? (
                    <CircleMarker
                      center={livePoint}
                      radius={11}
                      pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.9, weight: 3 }}
                    >
                      <Popup>
                        <div className="text-sm leading-5">
                          <strong>Live position</strong>
                          <br />
                          {live?.updated_at ? formatDateTime(live.updated_at) : "Updating…"}
                          <br />
                          Live GPS position
                        </div>
                      </Popup>
                    </CircleMarker>
                  ) : null}
                </MapContainer>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Journey Flow</h2>
                  <span className="text-xs text-slate-500">{checkpointPoints.length} checkpoints</span>
                </div>
              </CardHeader>
              <CardContent>
                {journey.data?.length ? (
                  <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                    {journey.data.map((point, index) => (
                      <div key={point.id} className="relative pl-7">
                        <span
                          className={`absolute left-1 top-1.5 size-3 rounded-full ${
                            index === journey.data!.length - 1 ? "bg-red-600" : "bg-blue-600"
                          }`}
                        />
                        {index < journey.data!.length - 1 ? (
                          <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
                        ) : null}

                        <p className="break-words font-semibold">
                          {point.address || `GPS ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(point.recorded_at)}</p>

                        {point.distance_from_previous_km > 0 ? (
                          <p className="text-sm font-medium text-blue-700">
                            +{point.distance_from_previous_km.toFixed(2)} km from previous checkpoint
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500">Starting point</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No journey checkpoints yet"
                    description="Tracking begins when the employee starts today's work session."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="font-semibold">Live status</h2></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Employee: <strong>{selected?.full_name}</strong></p>
                <p>Current status: <strong>{live?.is_working ? "Working" : "Not working"}</strong></p>
                <p>Last update: <strong>{live ? formatDateTime(live.updated_at) : "—"}</strong></p>
                <p>Battery: <strong>{live?.battery_percent != null ? `${live.battery_percent}%` : "Unavailable"}</strong></p>
                <p>Vehicle type: <strong>{summary.data?.vehicleType ?? "Not available from today's visits"}</strong></p>
                <p>Checkpoints today: <strong>{journey.data?.length ?? 0}</strong></p>
                <p>Today's travelled: <strong>{formatKm(totalKm)}</strong></p>
                <p>Month's travelled: <strong>{formatKm(summary.data?.monthKm ?? 0)}</strong></p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
