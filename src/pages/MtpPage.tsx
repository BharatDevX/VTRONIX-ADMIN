import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, MessageSquare, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { OperationalPage } from "@/components/operations/OperationalPage";
import { StatusBadge } from "@/components/ui/status-badge";
import { MtpEntriesDrawer } from "@/features/mtp/MtpEntriesDrawer";
import { useMtpRecords, useUpdateMtpStatus } from "@/features/mtp/hooks";
import { formatDateTime } from "@/lib/format";
import type { MtpRecord, PaginatedQuery } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

type MtpAction = "approved" | "rejected";

export default function MtpPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MtpRecord | null>(null);
  const [entriesDrawerOpen, setEntriesDrawerOpen] = useState(false);
  const [entriesProgramme, setEntriesProgramme] = useState<MtpRecord | null>(null);
  const [actionType, setActionType] = useState<MtpAction>("approved");
  const [remarks, setRemarks] = useState<string>("");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const mtp = useMtpRecords(filters);
  const updateStatus = useUpdateMtpStatus();

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    setRemarks(selectedRecord?.remarks ?? "");
  }, [selectedRecord]);

  const columns = useMemo<ColumnDef<MtpRecord>[]>(
    () => [
      {
        accessorKey: "employee_name",
        cell: ({ row }) => (
          <button
            className="font-medium text-slate-950 underline-offset-2 hover:underline dark:text-white"
            onClick={() => {
              setEntriesProgramme(row.original);
              setEntriesDrawerOpen(true);
            }}
            title="View every tour entry submitted by this employee"
            type="button"
          >
            {row.original.employee_name}
          </button>
        ),
        header: "Employee",
      },
      { accessorKey: "month", cell: ({ row }) => `${row.original.month}/${row.original.year}`, header: "Month" },
      { accessorKey: "planned_days", header: "Planned Days" },
      { accessorKey: "total_km", cell: ({ row }) => `${row.original.total_km} KM`, header: "Planned KM" },
      { accessorKey: "status", cell: ({ row }) => <StatusBadge value={row.original.status} />, header: "Status" },
      { accessorKey: "remarks", header: "Remarks" },
      { accessorKey: "updated_at", cell: ({ row }) => formatDateTime(row.original.updated_at), header: "Updated" },
      {
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setEntriesProgramme(row.original);
                setEntriesDrawerOpen(true);
              }}
              size="icon"
              title="View tour entries"
              variant="ghost"
            >
              <Eye />
            </Button>
            <Button
              onClick={() => {
                setSelectedRecord(row.original);
                setActionType("approved");
                setDrawerOpen(true);
              }}
              size="icon"
              title="Approve MTP"
              variant="ghost"
            >
              <Check />
            </Button>
            <Button
              onClick={() => {
                setSelectedRecord(row.original);
                setActionType("rejected");
                setDrawerOpen(true);
              }}
              size="icon"
              title="Reject MTP"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [],
  );

  const handleSave = async () => {
    if (!selectedRecord) return;
    try {
      await updateStatus.mutateAsync({ id: selectedRecord.id, status: actionType, remarks: remarks.trim() || null });
      setFeedback({ message: `MTP ${actionType === "approved" ? "approved" : "rejected"} successfully.`, type: "success" });
      setDrawerOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Failed to save MTP review.", type: "error" });
    }
  };

  return (
    <>
      <OperationalPage
        columns={columns}
        count={mtp.data?.count ?? 0}
        data={mtp.data?.data ?? []}
        description="Monthly tour programme approval, rejection, remarks, history, calendar source, and PDF-friendly report export."
        emptyDescription="Pending MTP submissions from employees will appear here."
        emptyTitle="No MTP records found"
        exportFilename="monthly-tour-programme.csv"
        filters={filters}
        isLoading={mtp.isLoading}
        rowsForExport={(records) => records.map((record) => ({ employee: record.employee_name, month: `${record.month}/${record.year}`, planned_days: record.planned_days, remarks: record.remarks, status: record.status }))}
        setFilters={setFilters}
        statusOptions={[
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ]}
        title="Monthly Tour Programme"
      />

      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={selectedRecord ? `${actionType === "approved" ? "Approve" : "Reject"} MTP` : "Review MTP"}>
        <div className="space-y-4">
          {selectedRecord ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Employee</p>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedRecord.employee_name}</p>
              <p className="text-sm text-slate-500">Month</p>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedRecord.month}/{selectedRecord.year}</p>
              <p className="text-sm text-slate-500">Planned KM</p>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedRecord.total_km} KM</p>
              <p className="text-sm text-slate-500">Current status</p>
              <StatusBadge value={selectedRecord.status} />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Remarks</span>
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                rows={5}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Add review remarks for this MTP"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={updateStatus.isPending}>
              {actionType === "approved" ? "Approve" : "Reject"}
            </Button>
            <Button onClick={() => setDrawerOpen(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>

      <MtpEntriesDrawer
        onClose={() => {
          setEntriesDrawerOpen(false);
          setEntriesProgramme(null);
        }}
        open={entriesDrawerOpen}
        programme={entriesProgramme}
      />

      {feedback ? (
        <div className={`fixed bottom-4 right-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            <span>{feedback.message}</span>
          </div>
        </div>
      ) : null}
    </>
  );
}