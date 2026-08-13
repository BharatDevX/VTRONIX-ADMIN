import type { ColumnDef } from "@tanstack/react-table";
import { PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSales } from "@/features/sales/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaginatedQuery, SalesRecord } from "@/types/domain";
import SaleDeliveryDrawer from "@/features/salesDelivery/SaleDeliveryDrawer";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function SalesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedSale, setSelectedSale] = useState<SalesRecord | null>(null);
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
      {
        id: "delivery",
        header: "Delivery",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedSale(row.original)}>
            <PackageCheck className="mr-2 size-4" /> Manage
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <OperationalPage
        columns={columns}
        count={sales.data?.count ?? 0}
        data={sales.data?.data ?? []}
        description="Order form entries across counter, doctor, retailer, and farmer sales with delivery tracking and invoice uploads."
        emptyDescription="Order form records submitted from the mobile app will appear here."
        emptyTitle="No order forms found"
        exportFilename="order-form.csv"
        filters={filters}
        isLoading={sales.isLoading}
        rowsForExport={(records) => records.map((record) => ({ amount: record.amount, channel: record.channel, customer: record.customer_name, date: record.sale_date, dealer: record.dealer_name, employee: record.employee_name, product: record.product_name, quantity: record.quantity, rate: record.rate, retailer: record.retailer_name ?? "", farmer: record.farmer_name ?? "" }))}
        setFilters={setFilters}
        statusOptions={[
          { label: "All", value: "all" },
          { label: "Counter", value: "counter" },
          { label: "Doctor", value: "doctor" },
          { label: "Retailer", value: "retailer" },
          { label: "Farmer", value: "farmer" },
        ]}
        title="Order Form"
      />

      <SaleDeliveryDrawer sale={selectedSale} open={Boolean(selectedSale)} onClose={() => setSelectedSale(null)} />
    </>
  );
}
