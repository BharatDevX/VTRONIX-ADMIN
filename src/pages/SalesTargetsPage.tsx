import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, IndianRupee, RefreshCw, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { getSalesTargets, saveSalesTarget, type SalesTargetRecord } from "@/features/salesTargets/service";
import type { Employee } from "@/types/domain";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SalesTargetsPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [employeeId, setEmployeeId] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targets, setTargets] = useState<SalesTargetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const employeesQuery = useEmployees({
    branch: "",
    designation: "",
    isActive: "active",
    page: 1,
    pageSize: 500,
    search: "",
  });

  const employees = employeesQuery.data?.data ?? [];
  const employeeMap = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);

  const loadTargets = useCallback(async () => {
    setLoading(true);
    try {
      setTargets(await getSalesTargets(month, year));
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load sales targets.",
      });
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  const selectedTarget = useMemo(
    () => targets.find((target) => target.employee_id === employeeId),
    [employeeId, targets],
  );

  useEffect(() => {
    if (selectedTarget) {
      setTargetAmount(String(selectedTarget.target_amount));
    } else if (employeeId) {
      setTargetAmount("");
    }
  }, [employeeId, selectedTarget]);

  const handleSave = async () => {
    const amount = Number(targetAmount);
    if (!employeeId) {
      setFeedback({ type: "error", message: "Please select an employee." });
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setFeedback({ type: "error", message: "Please enter a valid target amount." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await saveSalesTarget(employeeId, month, year, amount);
      await loadTargets();
      setFeedback({ type: "success", message: "Monthly sales target saved successfully." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save sales target.",
      });
    } finally {
      setSaving(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, index) => today.getFullYear() - 1 + index);

  return (
    <div className="space-y-6 p-5 lg:p-6">
      <PageHeader
        title="Monthly Sales Targets"
        description="Assign an individual monthly sales target to each employee. The employee app will use this target in the Monthly Sales / Target dashboard card."
        actions={
          <Button disabled={loading} onClick={() => void loadTargets()} variant="outline">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      {feedback ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5" />
              Assign Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Month">
                <select className={inputClassName} value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                  {monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                </select>
              </Field>
              <Field label="Year">
                <select className={inputClassName} value={year} onChange={(event) => setYear(Number(event.target.value))}>
                  {years.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Employee">
              <select className={inputClassName} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name} ({employee.employee_id})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Monthly Target Amount (₹)">
              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClassName} pl-9`}
                  inputMode="decimal"
                  min="0"
                  placeholder="e.g. 500000"
                  type="number"
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                />
              </div>
            </Field>

            <Button className="w-full" disabled={saving || employeesQuery.isLoading} onClick={() => void handleSave()}>
              <Check className="size-4" />
              {saving ? "Saving..." : selectedTarget ? "Update Target" : "Save Target"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {monthNames[month - 1]} {year} — Assigned Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading targets...</div>
            ) : targets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
                No monthly targets have been assigned for this month yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-3">Employee</th>
                      <th className="px-3 py-3">Employee ID</th>
                      <th className="px-3 py-3">Designation</th>
                      <th className="px-3 py-3 text-right">Target</th>
                      <th className="px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map((target) => {
                      const employee = employeeMap.get(target.employee_id) as Employee | undefined;
                      return (
                        <tr className="border-b last:border-0 dark:border-slate-800" key={target.id}>
                          <td className="px-3 py-4 font-semibold">{employee?.full_name ?? "Unknown employee"}</td>
                          <td className="px-3 py-4 text-slate-500">{employee?.employee_id ?? target.employee_id}</td>
                          <td className="px-3 py-4 text-slate-500">{employee?.designation ?? "—"}</td>
                          <td className="px-3 py-4 text-right font-semibold">{formatAmount(Number(target.target_amount))}</td>
                          <td className="px-3 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEmployeeId(target.employee_id);
                                setTargetAmount(String(target.target_amount));
                              }}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
