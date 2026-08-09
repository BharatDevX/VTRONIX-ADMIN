import { Drawer } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import { useMtpProgrammeEntries } from "@/features/mtp/hooks";
import type { MtpRecord } from "@/types/domain";

interface MtpEntriesDrawerProps {
  onClose: () => void;
  open: boolean;
  programme: MtpRecord | null;
}

export function MtpEntriesDrawer({ onClose, open, programme }: MtpEntriesDrawerProps) {
  const entriesQuery = useMtpProgrammeEntries(open ? programme?.id ?? null : null);
  const entries = entriesQuery.data?.entries ?? [];
  const summary = entriesQuery.data?.summary;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={programme ? `${programme.employee_name} — Tour Entries` : "Tour Entries"}
      widthClassName="max-w-3xl"
    >
      {programme ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Programme</p>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {programme.month}/{programme.year}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <StatusBadge value={programme.status} />
            </div>
            {programme.status === "rejected" && programme.remarks ? (
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Rejection remarks</p>
                <p className="truncate text-sm font-medium text-rose-600">{programme.remarks}</p>
              </div>
            ) : null}
          </div>

          {entriesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" key={index} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No tour entries found for this programme.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      {["Date", "HQ/EX/TOUR", "Route Details", "Travel Mode", "Route No.", "Total KM", "Planned Customers", "Seq.", "Status"].map((header) => (
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" key={header}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.tour_date ? formatDate(entry.tour_date) : "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.day_type ?? "-"}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{entry.route_details ?? "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.travel_mode ?? "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.route_number ?? "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.total_km} KM</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.planned_customers ?? "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">{entry.sequence_number ?? "-"}</td>
                        <td className="whitespace-nowrap px-3 py-2">{entry.status ? <StatusBadge value={entry.status} /> : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {summary ? (
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Tour Days</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{summary.totalTourDays}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Routes</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{summary.totalRoutes}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total KM</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{summary.totalKm} KM</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Planned Customers</p>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{summary.totalPlannedCustomers}</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Drawer>
  );
}