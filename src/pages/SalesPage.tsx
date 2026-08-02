import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { Badge } from "@/components/ui/badge";
import { useSales } from "@/features/sales/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaginatedQuery, SalesRecord } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function SalesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const sales = useSales(filters);
  const columns = useMemo<ColumnDef<SalesRecord>[]>(
    () => [
      { accessorKey: "sale_date", cell: ({ row }) => formatDate(row.original.sale_date), header: "Date" },
      { accessorKey: "employee_name", header: "Employee" },
      { accessorKey: "customer_name", header: "Customer" },
      { accessorKey: "product_name", header: "Product" },
      { accessorKey: "channel", cell: ({ row }) => <Badge tone="info">{row.original.channel}</Badge>, header: "Channel" },
      { accessorKey: "quantity", header: "Qty" },
      { accessorKey: "rate", cell: ({ row }) => formatCurrency(row.original.rate), header: "Rate" },
      { accessorKey: "amount", cell: ({ row }) => formatCurrency(row.original.amount), header: "Amount" },
    ],
    [],
  );

  return (
    <OperationalPage
      columns={columns}
      count={sales.data?.count ?? 0}
      data={sales.data?.data ?? []}
      description="Primary and secondary sales, products, invoices, targets, and revenue export."
      emptyDescription="Sales submitted by medical representatives will appear here."
      emptyTitle="No sales found"
      exportFilename="sales.csv"
      filters={filters}
      isLoading={sales.isLoading}
      rowsForExport={(records) => records.map((record) => ({ amount: record.amount, channel: record.channel, customer: record.customer_name, date: record.sale_date, dealer: record.dealer_name, employee: record.employee_name, product: record.product_name, quantity: record.quantity, rate: record.rate }))}
      setFilters={setFilters}
      statusOptions={[
        { label: "Counter", value: "counter" },
        { label: "Doctor", value: "doctor" },
      ]}
      title="Sales"
    />
  );
}
