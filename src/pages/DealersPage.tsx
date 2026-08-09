import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { inputClassName } from "@/lib/form-style";
import { exportCSV } from "@/services/export.service";
import { useCreateDealer, useDeleteDealer, useDealers, useToggleDealerStatus, useUpdateDealer } from "../features/dealers/dealerMaster.hooks";
import type { Dealer, PaginatedQuery } from "@/types/domain";

const DealerSchema = z.object({
  dealer_name: z.string().trim().min(3, "Dealer name is required"),
  
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Enter valid mobile number"),
  email: z.string().trim().email("Enter valid email").or(z.literal("")),
  city: z.string().trim().min(2, "City is required"),
 
  is_active: z.boolean().default(true),
});

type DealerFormData = z.infer<typeof DealerSchema>;

const defaultFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

function DealerForm({ dealer, onDone, onFeedback }: { dealer?: Dealer; onDone: () => void; onFeedback: (message: string, type: "success" | "error") => void }) {
  const createMutation = useCreateDealer();
  const updateMutation = useUpdateDealer();
  const form = useForm<DealerFormData>({
    defaultValues: dealer
      ? {
          dealer_name: dealer.dealer_name,
          mobile: dealer.mobile,
          email: dealer.email,
          city: dealer.city,
          is_active: dealer.is_active,
        }
      : { dealer_name: "", mobile: "", email: "", city: "", is_active: true },
    resolver: zodResolver(DealerSchema) as any,
  });

  const onSubmit: SubmitHandler<DealerFormData> = async (values) => {
    try {
      if (dealer) {
        await updateMutation.mutateAsync({ id: dealer.id, payload: values });
        onFeedback("Dealer updated successfully.", "success");
      } else {
        await createMutation.mutateAsync({
          ...values, is_active: values.is_active ?? true,
          contact_person: "",
          state: "",
          address: "",
          gst_number: ""
        });
        onFeedback("Dealer created successfully.", "success");
      }
      onDone();
    } catch (error) {
      onFeedback(error instanceof Error ? error.message : "Unable to save dealer.", "error");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Field label="Dealer name" error={form.formState.errors.dealer_name?.message}>
        <input className={inputClassName()} {...form.register("dealer_name")} />
      </Field>
     
      <Field label="Mobile" error={form.formState.errors.mobile?.message}>
        <input className={inputClassName()} {...form.register("mobile")} />
      </Field>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input className={inputClassName()} type="email" {...form.register("email")} />
      </Field>
      <Field label="City" error={form.formState.errors.city?.message}>
        <input className={inputClassName()} {...form.register("city")} />
      </Field>
      <div className="flex items-center gap-3">
        <input className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" id="active" type="checkbox" {...form.register("is_active")} />
        <label htmlFor="active" className="text-sm text-slate-600 dark:text-slate-300">
          Active
        </label>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
        {dealer ? (form.formState.isSubmitting || updateMutation.isPending ? "Saving..." : "Save dealer") : form.formState.isSubmitting || createMutation.isPending ? "Creating..." : "Create dealer"}
      </Button>
    </form>
  );
}

export default function DealersPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | undefined>();
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const dealers = useDealers(filters);
  const toggleStatus = useToggleDealerStatus();
  const deleteMutation = useDeleteDealer();

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const columns = useMemo(
    () => [
      { accessorKey: "dealer_name", header: "Dealer Name" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "is_active", cell: ({ row }: any) => <StatusBadge value={row.original.is_active} />, header: "Status" },
      { accessorKey: "created_at", cell: ({ row }: any) => formatDate(row.original.created_at), header: "Created" },
      {
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setSelectedDealer(row.original);
                setDrawerOpen(true);
              }}
              size="icon"
              title="Edit dealer"
              variant="ghost"
            >
              <Edit3 />
            </Button>
            <Button
              onClick={() => void toggleStatus.mutateAsync({ id: row.original.id, is_active: !row.original.is_active })}
              size="icon"
              title={row.original.is_active ? "Deactivate dealer" : "Activate dealer"}
              variant="ghost"
            >
              <Badge tone="info">{row.original.is_active ? "On" : "Off"}</Badge>
            </Button>
            <Button
              onClick={() => {
                if (!window.confirm("Delete this dealer?")) return;
                void deleteMutation.mutateAsync(row.original.id);
              }}
              size="icon"
              title="Delete dealer"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [deleteMutation, toggleStatus],
  );

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button
              onClick={() =>
                exportCSV(
                  "dealers.csv",
                  (dealers.data?.data ?? []).map((dealer) => ({
                   
                    city: dealer.city,
                   
                    dealer_name: dealer.dealer_name,
                    email: dealer.email,
                   
                    mobile: dealer.mobile,
                    
                    status: dealer.is_active ? "Active" : "Inactive",
                  })),
                )
              }
              variant="outline"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setSelectedDealer(undefined);
                setDrawerOpen(true);
              }}
            >
              <Plus />
              Add dealer
            </Button>
          </>
        }
        description="Dealer master database used for dealer visits, order forms, and field reporting. Separate from Dealer Visits history."
        eyebrow="Dealer operations"
        title="Dealer Master"
      />

      <div className="space-y-5 p-5">
        {feedback ? (
          <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {feedback.message}
          </div>
        ) : null}

        <Card>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_160px_180px_180px]">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <Search className="size-4" />
              <input
                className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                onChange={(event) => setFilters((value) => ({ ...value, page: 1, search: event.target.value }))}
                placeholder="Search dealer, contact, city, GST"
                value={filters.search}
              />
            </label>
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, page: 1, branch: event.target.value }))} placeholder="State" value={filters.branch} />
            <select
              className={inputClassName()}
              onChange={(event) => setFilters((value) => ({ ...value, page: 1, status: event.target.value }))}
              value={filters.status}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </CardContent>
        </Card>

        <DataTable columns={columns} data={dealers.data?.data ?? []} emptyDescription="Add dealers to the master database for visits, orders, and reporting." emptyTitle="No dealers found" isLoading={dealers.isLoading} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge>{dealers.data?.count ?? 0} records</Badge>
          <div className="flex items-center gap-2">
            <Button disabled={filters.page === 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} variant="outline">
              Previous
            </Button>
            <Button disabled={!dealers.data || filters.page * filters.pageSize >= dealers.data.count} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} variant="outline">
              Next
            </Button>
          </div>
        </div>
      </div>

      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={selectedDealer ? "Edit dealer" : "Add dealer"}>
        <DealerForm dealer={selectedDealer} onDone={() => setDrawerOpen(false)} onFeedback={(message, type) => setFeedback({ message, type })} />
      </Drawer>
    </div>
  );
}