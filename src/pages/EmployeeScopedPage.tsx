import { ArrowLeft, FileDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import { getAllEmployees } from "@/features/adminEmployee/services/adminEmployee.service";
import type { Employee } from "@/types/domain";
import { printTableReport } from "@/services/export.service";

type ActivityRow = Record<string, unknown>;

interface EmployeeScopedPageProps {
  title: string;
  description: string;
  columns: Array<{ key: string; label: string }>;
  load: (employeeId: string) => Promise<unknown[]>;
}

export default function EmployeeScopedPage({ title, description, columns, load }: EmployeeScopedPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      setEmployees(await getAllEmployees());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadEmployees(); }, []);

  const selectEmployee = async (employee: Employee) => {
    setSelected(employee);
    setLoading(true);
    setError(null);
    try {
      setRows((await load(employee.id)) as ActivityRow[]);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : `Unable to load ${title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <PageHeader title={selected ? `${title} — ${selected.full_name}` : title} description={description} actions={selected ? <div className="flex gap-2"><Button variant="outline" onClick={() => void selectEmployee(selected)}><RefreshCw className="size-4" />Refresh</Button><Button variant="outline" onClick={() => printTableReport(title, selected.full_name, columns, rows)}><FileDown className="size-4" />PDF</Button><Button variant="outline" onClick={() => { setSelected(null); setRows([]); }}><ArrowLeft className="size-4" />Employees</Button></div> : undefined} />
      {!selected ? <EmployeePicker employees={employees} selectedId="" onSelect={(employee) => void selectEmployee(employee)} /> : null}
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {selected ? (
        <Card>
          <CardHeader><CardTitle>{rows.length} records</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="py-12 text-center text-sm text-slate-500">Loading...</div> : rows.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">No records found for this employee.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">{columns.map((column) => <th className="px-3 py-3" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className="border-b last:border-0 dark:border-slate-800" key={String(row.id ?? index)}>{columns.map((column) => <td className="px-3 py-3 align-top" key={column.key}>{formatCell(row[column.key])}</td>)}</tr>)}</tbody></table></div>}
          </CardContent>
        </Card>
      ) : null}
      {!selected && loading && employees.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-slate-500">Loading employees...</CardContent></Card> : null}
    </div>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
