import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMtpRecords, useUpdateMtpStatus } from "@/features/mtp/hooks";
import { formatDateTime } from "@/lib/format";
import type { MtpRecord, PaginatedQuery } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function MtpPage() {
  const [filters, setFilters] = useState(initialFilters);
  const mtp = useMtpRecords(filters);
  const updateStatus = useUpdateMtpStatus();
  const columns = useMemo<ColumnDef<MtpRecord>[]>(
    () => [
      { accessorKey: "employee_name", header: "Employee" },
      { accessorKey: "month", cell: ({ row }) => `${row.original.month}/${row.original.year}`, header: "Month" },
      { accessorKey: "planned_days", header: "Planned Days" },
      { accessorKey: "total_km", cell: ({ row }) => `${row.original.total_km} KM`, header: "Planned KM" },
      { accessorKey: "status", cell: ({ row }) => <StatusBadge value={row.original.status} />, header: "Status" },
      { accessorKey: "remarks", header: "Remarks" },
      { accessorKey: "updated_at", cell: ({ row }) => formatDateTime(row.original.updated_at), header: "Updated" },
      {
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button onClick={() => void updateStatus.mutateAsync({ id: row.original.id, remarks: row.original.remarks, status: "approved" })} size="icon" title="Approve MTP" variant="ghost">
              <Check />
            </Button>
            <Button onClick={() => void updateStatus.mutateAsync({ id: row.original.id, remarks: row.original.remarks, status: "rejected" })} size="icon" title="Reject MTP" variant="ghost">
              <X />
            </Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [updateStatus],
  );

  return (
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
      rowsForExport={(records) => records.map((record) => ({ employee: record.employee_name, month: record.month, planned_days: record.planned_days, remarks: record.remarks, status: record.status }))}
      setFilters={setFilters}
      statusOptions={[
        { label: "Draft", value: "draft" },
        { label: "Submitted", value: "submitted" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ]}
      title="Monthly Tour Programme"
    />
  );
}
