import type { ColumnDef } from "@tanstack/react-table";
import { Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/table";
import { inputClassName } from "@/lib/form-style";
import { exportCSV } from "@/services/export.service";
import type { PaginatedQuery } from "@/types/domain";

type ExportRow = Record<string, unknown>;

interface OperationalPageProps<T> {
  columns: ColumnDef<T>[];
  count: number;
  data: T[];
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  exportFilename: string;
  filters: PaginatedQuery;
  isLoading: boolean;
  rowsForExport: (records: T[]) => ExportRow[];
  setFilters: React.Dispatch<React.SetStateAction<PaginatedQuery>>;
  statusOptions?: Array<{ label: string; value: string }>;
  title: string;
}

export function OperationalPage<T>({
  columns,
  count,
  data,
  description,
  emptyDescription,
  emptyTitle,
  exportFilename,
  filters,
  isLoading,
  rowsForExport,
  setFilters,
  statusOptions = [],
  title,
}: OperationalPageProps<T>) {
  return (
    <div>
      <PageHeader
        actions={
          <Button
  onClick={() =>
    exportCSV(
      exportFilename,
      rowsForExport(data)
    )
  }
  variant="outline"
>
  <Download />
  Export CSV
</Button>
        }
        description={description}
        eyebrow="Operations"
        title={title}
      />
      <div className="space-y-5 p-5">
        <Card>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500">
              <Search className="size-4" />
              <input
                className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                onChange={(event) => setFilters((value) => ({ ...value, page: 1, search: event.target.value }))}
                placeholder="Search records"
                value={filters.search}
              />
            </label>
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, branch: event.target.value }))} placeholder="Branch" value={filters.branch} />
            <select
              className={inputClassName()}
              onChange={(event) => setFilters((value) => ({ ...value, page: 1, status: event.target.value }))}
              value={filters.status}
            >
              <option value="all">All status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <DataTable columns={columns} data={data} emptyDescription={emptyDescription} emptyTitle={emptyTitle} isLoading={isLoading} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <Badge>{count} records</Badge>
          <div className="flex items-center gap-2">
            <Button disabled={filters.page === 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} variant="outline">
              Previous
            </Button>
            <Button disabled={filters.page * filters.pageSize >= count} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} variant="outline">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
