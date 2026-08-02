import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, KeyRound, Plus, Power, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/table";
import { employeeEditSchema, employeeSchema, type EmployeeEditFormData, type EmployeeFormData } from "@/features/employees/validation/employee.schema";
import { useCreateEmployee, useEmployees, useResetEmployeePassword, useToggleEmployeeStatus, useUpdateEmployee } from "@/features/employees/hooks/useEmployees";
import type { Employee } from "@/types/domain";
import { formatDate } from "@/lib/format";
import { inputClassName } from "@/lib/form-style";
import { exportCSV } from "@/services/export.service";

const defaultFilters = {
  branch: "",
  designation: "",
  isActive: "all" as const,
  page: 1,
  pageSize: 10,
  search: "",
};

type FeedbackState = {
  message: string;
  type: "error" | "success";
};

function EmployeeForm({ employee, onDone, onFeedback }: { employee?: Employee; onDone: () => void; onFeedback: (feedback: FeedbackState) => void }) {
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const form = useForm<EmployeeFormData | EmployeeEditFormData>({
    defaultValues: employee
      ? {
          branch: employee.branch,
          designation: employee.designation,
          email: employee.email,
          full_name: employee.full_name,
          mobile: employee.mobile,
        }
      : {
          branch: "",
          designation: "",
          email: "",
          employee_id: "",
          full_name: "",
          mobile: "",
          password: "",
        },
    resolver: zodResolver(employee ? employeeEditSchema : employeeSchema),
  });
  const createErrors = form.formState.errors as Partial<Record<keyof EmployeeFormData, { message?: string }>>;
  const isSubmitting = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          if (employee) {
            await updateMutation.mutateAsync({ id: employee.id, payload: values as EmployeeEditFormData });
            onFeedback({ message: "Employee updated successfully.", type: "success" });
          } else {
            await createMutation.mutateAsync(values as EmployeeFormData);
            onFeedback({ message: "Employee created successfully. They can sign in immediately with their employee ID and password.", type: "success" });
          }
          onDone();
        } catch (error) {
          onFeedback({
            message: error instanceof Error ? error.message : "Unable to save employee.",
            type: "error",
          });
        }
      })}
    >
      {!employee ? (
        <Field error={createErrors.employee_id?.message} label="Employee ID">
          <input className={inputClassName()} {...form.register("employee_id" as const)} />
        </Field>
      ) : null}
      <Field error={form.formState.errors.full_name?.message} label="Full name">
        <input className={inputClassName()} {...form.register("full_name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={form.formState.errors.designation?.message} label="Designation">
          <input className={inputClassName()} {...form.register("designation")} />
        </Field>
        <Field error={form.formState.errors.branch?.message} label="Branch">
          <input className={inputClassName()} {...form.register("branch")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={form.formState.errors.mobile?.message} label="Mobile">
          <input className={inputClassName()} {...form.register("mobile")} />
        </Field>
        <Field error={form.formState.errors.email?.message} label="Email">
          <input className={inputClassName()} {...form.register("email")} />
        </Field>
      </div>
      {!employee ? (
        <Field error={createErrors.password?.message} label="Temporary password">
          <input className={inputClassName()} type="password" {...form.register("password" as const)} />
        </Field>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {employee ? (isSubmitting ? "Saving..." : "Save employee") : isSubmitting ? "Creating..." : "Create employee"}
      </Button>
    </form>
  );
}

export default function EmployeesPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [drawerEmployee, setDrawerEmployee] = useState<Employee | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const employees = useEmployees(filters);
  const toggleStatus = useToggleEmployeeStatus();
  const resetPassword = useResetEmployeePassword();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: "employee_id", header: "Employee ID" },
      {
        accessorKey: "full_name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-950">{row.original.full_name}</p>
            <p className="text-xs text-slate-500">{row.original.email}</p>
          </div>
        ),
        header: "Name",
      },
      { accessorKey: "designation", header: "Designation" },
      { accessorKey: "branch", header: "Branch" },
      { accessorKey: "mobile", header: "Mobile" },
      {
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge value={row.original.is_active} />,
        header: "Status",
      },
      {
        accessorKey: "created_at",
        cell: ({ row }) => formatDate(row.original.created_at),
        header: "Created Date",
      },
      {
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              onClick={() => {
                setDrawerEmployee(row.original);
                setDrawerOpen(true);
              }}
              size="icon"
              title="Edit employee"
              variant="ghost"
            >
              <Edit3 />
            </Button>
            <Button onClick={() => void resetPassword.mutateAsync(row.original.id)} size="icon" title="Reset password" variant="ghost">
              <KeyRound />
            </Button>
            <Button
              onClick={() => void toggleStatus.mutateAsync({ id: row.original.id, is_active: !row.original.is_active })}
              size="icon"
              title={row.original.is_active ? "Deactivate employee" : "Activate employee"}
              variant="ghost"
            >
              <Power />
            </Button>
          </div>
        ),
        header: "Actions",
      },
    ],
    [resetPassword, toggleStatus],
  );

  return (
    <div>
      <PageHeader
        actions={
          <>
            <Button
              onClick={() =>
                exportCSV(
                  "employees.csv",
                  (employees.data?.data ?? []).map((employee) => ({
                    branch: employee.branch,
                    designation: employee.designation,
                    email: employee.email,
                    employee_id: employee.employee_id,
                    full_name: employee.full_name,
                    mobile: employee.mobile,
                    status: employee.is_active ? "Active" : "Inactive",
                  })),
                )
              }
              variant="outline"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setDrawerEmployee(undefined);
                setDrawerOpen(true);
              }}
            >
              <Plus />
              Add employee
            </Button>
          </>
        }
        description="Search, filter, create, edit, deactivate, and reset access for field employees."
        eyebrow="People operations"
        title="Employees"
      />
      <div className="space-y-5 p-5">
        {feedback ? (
          <div
            className={feedback.type === "success" ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" : "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"}
          >
            {feedback.message}
          </div>
        ) : null}

        <Card>
          <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_180px_160px]">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500">
              <Search className="size-4" />
              <input
                className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                onChange={(event) => setFilters((value) => ({ ...value, page: 1, search: event.target.value }))}
                placeholder="Search name, ID, email"
                value={filters.search}
              />
            </label>
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, branch: event.target.value }))} placeholder="Branch" value={filters.branch} />
            <input className={inputClassName()} onChange={(event) => setFilters((value) => ({ ...value, designation: event.target.value }))} placeholder="Designation" value={filters.designation} />
            <select
              className={inputClassName()}
              onChange={(event) => setFilters((value) => ({ ...value, isActive: event.target.value as typeof filters.isActive }))}
              value={filters.isActive}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={employees.data?.data ?? []}
          emptyDescription="Create employees to manage attendance, sales, visits, routes, and MTP approvals."
          emptyTitle="No employees found"
          isLoading={employees.isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <Badge>{employees.data?.count ?? 0} records</Badge>
          <div className="flex items-center gap-2">
            <Button disabled={filters.page === 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} variant="outline">
              Previous
            </Button>
            <Button
              disabled={!employees.data || filters.page * filters.pageSize >= employees.data.count}
              onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={drawerEmployee ? "Edit employee" : "Add employee"}>
        <EmployeeForm employee={drawerEmployee} onDone={() => setDrawerOpen(false)} onFeedback={setFeedback} />
      </Drawer>
    </div>
  );
}
