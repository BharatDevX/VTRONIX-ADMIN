import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { useDealerVisits } from "@/features/dealer/hooks";
import { formatDate } from "@/lib/format";
import type { PaginatedQuery, VisitRecord } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function DealerPage() {
  const [filters, setFilters] = useState(initialFilters);
  const visits = useDealerVisits(filters);
  const columns = useMemo<ColumnDef<VisitRecord>[]>(
    () => [
      { accessorKey: "visit_date", cell: ({ row }) => formatDate(row.original.visit_date), header: "Date" },
      { accessorKey: "entity_name", header: "Dealer" },
      { accessorKey: "employee_name", header: "MR" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "outcome", header: "Outcome" },
      { accessorKey: "next_action", header: "Next Action" },
    ],
    [],
  );

  return (
    <OperationalPage
      columns={columns}
      count={visits.data?.count ?? 0}
      data={visits.data?.data ?? []}
      description="Dealer list, visits, meeting plans, outcomes, sales follow-ups, reports, and export."
      emptyDescription="Dealer visits submitted from the mobile app will appear here."
      emptyTitle="No dealer visits found"
      exportFilename="dealer-visits.csv"
      filters={filters}
      isLoading={visits.isLoading}
      rowsForExport={(records) => records.map((record) => ({ city: record.city, dealer: record.entity_name, employee: record.employee_name, next_action: record.next_action, outcome: record.outcome, visit_date: record.visit_date }))}
      setFilters={setFilters}
      title="Dealer"
    />
  );
}
