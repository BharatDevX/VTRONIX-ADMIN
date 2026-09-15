import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import { getAllEmployees, getEmployeeAttendance } from "@/features/adminEmployee/services/adminEmployee.service";
import { printTableReport } from "@/services/export.service";
import type { Employee } from "@/types/domain";

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AttendancePage() {
  const today = new Date();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void getAllEmployees().then(setEmployees).finally(() => setLoading(false)); }, []);

  const load = async (employee: Employee, targetYear = year, targetMonth = month) => {
    setSelected(employee); setLoading(true);
    try { setRows(await getEmployeeAttendance(employee.id, targetYear, targetMonth + 1)); }
    finally { setLoading(false); }
  };

  const days = useMemo(() => {
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [month, year]);
  const byDate = useMemo(() => new Map(rows.map((row) => [row.attendance_date, row])), [rows]);

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setMonth(next.getMonth()); setYear(next.getFullYear());
    if (selected) void load(selected, next.getFullYear(), next.getMonth());
  };

  return <div className="space-y-5 p-5 lg:p-6">
    <PageHeader title={selected ? `Attendance — ${selected.full_name}` : "Attendance"} description="Select an employee to view every day of that employee's monthly attendance." actions={selected ? <Button variant="outline" onClick={() => printTableReport("Monthly Attendance", `${selected.full_name} · ${monthNames[month]} ${year}`, [{key:"date",label:"Date"},{key:"status",label:"Status"},{key:"check_in_time",label:"Check In"},{key:"check_out_time",label:"Check Out"},{key:"working_minutes",label:"Working Minutes"}], days.map((day) => { const date = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`; const row=byDate.get(date); return {date,status:row?.status??"Not marked",check_in_time:row?.check_in_time??"—",check_out_time:row?.check_out_time??"—",working_minutes:row?.working_minutes??"—"}; }))}><FileDown className="size-4"/>PDF</Button> : undefined} />
    {!selected ? <EmployeePicker employees={employees} selectedId="" onSelect={(employee) => void load(employee)} /> : <>
      <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
        <Button variant="outline" onClick={() => setSelected(null)}>Employees</Button>
        <div className="flex items-center gap-3"><Button size="icon" variant="outline" onClick={() => changeMonth(-1)}><ChevronLeft/></Button><div className="min-w-40 text-center font-semibold">{monthNames[month]} {year}</div><Button size="icon" variant="outline" onClick={() => changeMonth(1)}><ChevronRight/></Button></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Daily Attendance</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-10 text-center text-sm text-slate-500">Loading attendance...</div> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{days.map((day) => { const date=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`; const row=byDate.get(date); return <div key={date} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><span className="font-semibold">{day} {monthNames[month].slice(0,3)}</span><span className="text-xs font-semibold">{row?.status??"NOT MARKED"}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500"><div>Check in<br/><b className="text-slate-800 dark:text-white">{row?.check_in_time??"—"}</b></div><div>Check out<br/><b className="text-slate-800 dark:text-white">{row?.check_out_time??"—"}</b></div><div>Working<br/><b className="text-slate-800 dark:text-white">{row?.working_minutes ?? 0} min</b></div><div>Address<br/><b className="text-slate-800 dark:text-white">{row?.address ?? "—"}</b></div></div></div>})}</div>}
      </CardContent></Card>
    </>}
  </div>;
}
