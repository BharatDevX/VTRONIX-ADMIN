/* eslint-disable react-hooks/incompatible-library */
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  emptyDescription: string;
  emptyTitle: string;
  isLoading?: boolean;
}

export function DataTable<T>({ columns, data, emptyDescription, emptyTitle, isLoading = false }: DataTableProps<T>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton className="h-12" key={index} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr className={cn("transition hover:bg-slate-50")} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
