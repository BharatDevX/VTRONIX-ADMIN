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
import { useCreateDoctor, useDeleteDoctor, useDoctors, useToggleDoctorStatus, useUpdateDoctor } from "@/features/doctors/hooks";
import type { Doctor, PaginatedQuery } from "@/types/domain";

const DoctorSchema = z.object({
  doctor_name: z.string().trim().min(3, "Doctor name is required"),
  specialization: z.string().trim(),
  city: z.string().trim().min(2, "City is required"),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, "Enter valid mobile number"),
  is_active: z.boolean().default(true),
});

type DoctorFormData = z.infer<typeof DoctorSchema>;

const defaultFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

function DoctorForm({ doctor, onDone, onFeedback }: { doctor?: Doctor; onDone: () => void; onFeedback: (message: string, type: "success" | "error") => void }) {
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const form = useForm<DoctorFormData>({
    defaultValues: doctor
      ? {
          doctor_name: doctor.doctor_name,
          specialization: doctor.specialization,
          city: doctor.city,
          mobile: doctor.mobile,
          is_active: doctor.is_active,
        }
      : { doctor_name: "", specialization: "", city: "", mobile: "", is_active: true },
    resolver: zodResolver(DoctorSchema) as any,
  });

  const onSubmit: SubmitHandler<DoctorFormData> = async (values) => {
    try {
      if (doctor) {
        await updateMutation.mutateAsync({ id: doctor.id, payload: values });
        onFeedback("Doctor updated successfully.", "success");
      } else {
        await createMutation.mutateAsync({ ...values, is_active: values.is_active ?? true });
        onFeedback("Doctor created successfully.", "success");
      }
      onDone();
    } catch (error) {
      onFeedback(error instanceof Error ? error.message : "Unable to save doctor.", "error");
    }
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Field label="Doctor name" error={form.formState.errors.doctor_name?.message}>
        <input className={inputClassName()} {...form.register("doctor_name")} />
      </Field>
      <Field label="Specialization" error={form.formState.errors.specialization?.message}>
        <input className={inputClassName()} {...form.register("specialization")} />
      </Field>
      <Field label="City" error={form.formState.errors.city?.message}>
        <input className={inputClassName()} {...form.register("city")} />
      </Field>
      <Field label="Mobile" error={form.formState.errors.mobile?.message}>
        <input className={inputClassName()} {...form.register("mobile")} />
      </Field>
      <div className="flex items-center gap-3">
        <input className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" id="active" type="checkbox" {...form.register("is_active")} />
        <label htmlFor="active" className="text-sm text-slate-600 dark:text-slate-300">
          Active
        </label>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending}>
        {doctor ? (form.formState.isSubmitting || updateMutation.isPending ? "Saving..." : "Save doctor") : form.formState.isSubmitting || createMutation.isPending ? "Creating..." : "Create doctor"}
      </Button>
    </form>
  );
}

export default function DoctorPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const doctors = useDoctors(filters);
  const toggleStatus = useToggleDoctorStatus();
  const deleteMutation = useDeleteDoctor();

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const columns = useMemo(
    () => [
      { accessorKey: "doctor_name", header: "Name" },
      { accessorKey: "specialization", header: "Specialization" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "mobile", header: "Mobile" },
      { accessorKey: "is_active", cell: ({ row }: any) => <StatusBadge value={row.original.is_active} />, header: "Status" },
      { accessorKey: "created_at", cell: ({ row }: any) => formatDate(row.original.created_at), header: "Created" },
      {
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setSelectedDoctor(row.original);
                setDrawerOpen(true);
              }}
              size="icon"
              title="Edit doctor"
              variant="ghost"
            >
              <Edit3 />
            </Button>
            <Button
              onClick={() => void toggleStatus.mutateAsync({ id: row.original.id, is_active: !row.original.is_active })}
              size="icon"
              title={row.original.is_active ? "Deactivate doctor" : "Activate doctor"}
              variant="ghost"
            >
              <Badge tone="info">{row.original.is_active ? "On" : "Off"}</Badge>
            </Button>
            <Button
              onClick={() => {
                if (!window.confirm("Delete this doctor?")) return;
                void deleteMutation.mutateAsync(row.original.id);
              }}
              size="icon"
              title="Delete doctor"
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
                  "doctors.csv",
                  (doctors.data?.data ?? []).map((doctor) => ({
                    city: doctor.city,
                    doctor_name: doctor.doctor_name,
                    mobile: doctor.mobile,
                    specialization: doctor.specialization,
                    status: doctor.is_active ? "Active" : "Inactive",
                  })),
                )
              }
              variant="outline"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setSelectedDoctor(undefined);
                setDrawerOpen(true);
              }}
            >
              <Plus />
              Add doctor
            </Button>
          </>
        }
        description="Doctor master data management for order form, sales mapping, and field reporting."
        eyebrow="Doctor operations"
        title="Doctors"
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
                placeholder="Search doctor, specialization, city"
                value={filters.search}
              />
            </label>
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, page: 1, branch: event.target.value }))} placeholder="City" value={filters.branch} />
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

        <DataTable columns={columns} data={doctors.data?.data ?? []} emptyDescription="Add doctor profiles used in order forms and sales reporting." emptyTitle="No doctors found" isLoading={doctors.isLoading} />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge>{doctors.data?.count ?? 0} records</Badge>
          <div className="flex items-center gap-2">
            <Button disabled={filters.page === 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} variant="outline">
              Previous
            </Button>
            <Button disabled={!doctors.data || filters.page * filters.pageSize >= doctors.data.count} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} variant="outline">
              Next
            </Button>
          </div>
        </div>
      </div>

      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={selectedDoctor ? "Edit doctor" : "Add doctor"}>
        <DoctorForm doctor={selectedDoctor} onDone={() => setDrawerOpen(false)} onFeedback={(message, type) => setFeedback({ message, type })} />
      </Drawer>
    </div>
  );
}
