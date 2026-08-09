import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDoctorVisits } from "@/features/doctor/hooks";
import { formatDate, formatDateTime } from "@/lib/format";
import type { DoctorVisitRecord, PaginatedQuery } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function DoctorVisitsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const visits = useDoctorVisits(filters);
  const columns = useMemo<ColumnDef<DoctorVisitRecord>[]>(
    () => [
      { accessorKey: "visit_date", cell: ({ row }) => formatDate(row.original.visit_date), header: "Visit Date" },
      { accessorKey: "doctor_name", header: "Doctor Name" },
      { accessorKey: "employee_name", header: "Medical Representative" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "discussion", header: "Discussion" },
      { accessorKey: "reply", cell: ({ row }) => row.original.reply ?? "-", header: "Reply" },
      { accessorKey: "next_followup_date", cell: ({ row }) => (row.original.next_followup_date ? formatDate(row.original.next_followup_date) : "-"), header: "Next Follow-up" },
      { accessorKey: "status", cell: ({ row }) => (row.original.status ? <StatusBadge value={row.original.status} /> : "-"), header: "Visit Status" },
      { accessorKey: "created_at", cell: ({ row }) => (row.original.created_at ? formatDateTime(row.original.created_at) : "-"), header: "Created At" },
    ],
    [],
  );

  return (
    <OperationalPage
      columns={columns}
      count={visits.data?.count ?? 0}
      data={visits.data?.data ?? []}
      description="View-only doctor visit history submitted from the Employee App. Search, filter, and export — editing happens in the mobile app."
      emptyDescription="Doctor visits submitted from the mobile app will appear here."
      emptyTitle="No doctor visits found"
      exportFilename="doctor-visits.csv"
      filters={filters}
      isLoading={visits.isLoading}
      rowsForExport={(records) =>
        records.map((record) => ({
          city: record.city,
          created_at: record.created_at,
          discussion: record.discussion,
          doctor: record.doctor_name,
          employee: record.employee_name,
          next_followup_date: record.next_followup_date,
          reply: record.reply,
          status: record.status,
          visit_date: record.visit_date,
        }))
      }
      setFilters={setFilters}
      title="Doctor Visits"
    />
  );
}