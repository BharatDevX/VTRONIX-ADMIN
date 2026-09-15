import { Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types/domain";

interface EmployeePickerProps {
  employees: Employee[];
  selectedId: string;
  onSelect: (employee: Employee) => void;
  title?: string;
  description?: string;
}

export function EmployeePicker({ employees, selectedId, onSelect, title = "Select Employee", description = "Choose an employee to view only that employee's records." }: EmployeePickerProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) => `${employee.full_name} ${employee.employee_id} ${employee.designation}`.toLowerCase().includes(q));
  }, [employees, search]);

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm text-slate-500 dark:border-slate-800">
          <Search className="size-4" />
          <input className="w-full bg-transparent outline-none dark:text-white" placeholder="Search employee" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((employee) => (
            <Button key={employee.id} type="button" variant={selectedId === employee.id ? "default" : "outline"} className="h-auto justify-start gap-3 p-3 text-left" onClick={() => onSelect(employee)}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"><UserRound className="size-4" /></span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{employee.full_name}</span>
                <span className="block truncate text-xs opacity-70">{employee.employee_id} · {employee.designation || "Employee"}</span>
              </span>
            </Button>
          ))}
        </div>
        {filtered.length === 0 ? <p className="py-5 text-center text-sm text-slate-500">No employees found.</p> : null}
      </CardContent>
    </Card>
  );
}
