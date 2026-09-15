import { ArrowLeft, FileDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import { sendEmployeeMessage, type EmployeeMessageType } from "../Features/employeeMessages/service";
import { getAllEmployees, getEmployeeAttendance, getEmployeeDoctorVisits, getEmployeeDealerVisits, getEmployeeFarmerVisits, getEmployeeFollowUps, getEmployeeOrderForms, getEmployeeSalesSummary } from "@/features/adminEmployee/services/adminEmployee.service";
import { printTableReport } from "@/services/export.service";
import type { Employee } from "@/types/domain";

function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }

export default function EmployeeProfilePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [counts, setCounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<EmployeeMessageType>("info");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  useEffect(() => { void getAllEmployees().then(setEmployees).finally(() => setLoading(false)); }, []);
  const load = async (employee: Employee) => {
    setSelected(employee); setLoading(true);
    try {
      const [sales, attendance, doctors, dealers, farmers, followUps, orders] = await Promise.all([
        getEmployeeSalesSummary(employee.id),
        getEmployeeAttendance(employee.id, new Date().getFullYear(), new Date().getMonth() + 1),
        getEmployeeDoctorVisits(employee.id), getEmployeeDealerVisits(employee.id), getEmployeeFarmerVisits(employee.id), getEmployeeFollowUps(employee.id), getEmployeeOrderForms(employee.id),
      ]);
      setSummary(sales); setCounts({ attendance: attendance.length, doctors: doctors.length, dealers: dealers.length, farmers: farmers.length, followUps: followUps.length, orders: orders.length });
    } finally { setLoading(false); }
  };
  const reportRows = selected && summary ? Object.entries(summary).map(([key,value]) => ({ metric:key.replace(/[A-Z]/g, (m)=>` ${m}`).replace(/^./,(m)=>m.toUpperCase()), value:money(Number(value)) })) : [];
  return <div className="space-y-5 p-5 lg:p-6">
    <PageHeader title={selected ? `Employee Profile — ${selected.full_name}` : "Employee Profile"} description="Complete operational snapshot for one employee." actions={selected ? <div className="flex gap-2"><Button variant="outline" onClick={() => void load(selected)}><RefreshCw className="size-4"/>Refresh</Button><Button variant="outline" onClick={() => printTableReport("Employee Sales Summary", selected.full_name, [{key:"metric",label:"Metric"},{key:"value",label:"Amount"}], reportRows)}><FileDown className="size-4"/>PDF</Button><Button variant="outline" onClick={() => setSelected(null)}><ArrowLeft className="size-4"/>Employees</Button></div> : undefined}/>
    {!selected ? <EmployeePicker employees={employees} selectedId="" onSelect={(employee)=>void load(employee)} /> : loading ? <Card><CardContent className="py-12 text-center text-sm text-slate-500">Loading employee data...</CardContent></Card> : <>
      <Card><CardContent className="grid gap-4 pt-5 md:grid-cols-4"><div><p className="text-xs text-slate-500">Employee ID</p><p className="font-semibold">{selected.employee_id}</p></div><div><p className="text-xs text-slate-500">Designation</p><p className="font-semibold">{selected.designation}</p></div><div><p className="text-xs text-slate-500">Head Quarter</p><p className="font-semibold">{(selected.head_quarters ?? []).join(", ") || selected.branch || "—"}</p></div><div><p className="text-xs text-slate-500">Mobile</p><p className="font-semibold">{selected.mobile}</p></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{[
        ["Today's Sales",money(summary.todaySales)], ["Monthly Sales",money(summary.monthlySales)], ["Counter Sale",money(summary.counterSales)], ["Secondary Sale",money(summary.secondarySales)], ["Doctor-wise Sale",money(summary.doctorWiseSales)], ["Sales Invoice",money(summary.invoiceSales)],
      ].map(([label,value])=><Card key={label}><CardContent className="pt-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></CardContent></Card>)}</div>
      <Card>
        <CardHeader>
          <CardTitle>Message Employee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Message Type</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
                value={messageType}
                onChange={(event) => setMessageType(event.target.value as EmployeeMessageType)}
                disabled={sendingMessage}
              >
                <option value="info">Information</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="order">Order</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Message for {selected.full_name}</label>
              <textarea
                className="min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setMessageFeedback(null);
                }}
                placeholder="Write the warning, information, alert, or order exactly as you want the employee to receive it..."
                rows={4}
                disabled={sendingMessage}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-slate-500">{message.length}/2000</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={sendingMessage || !message.trim()}
              onClick={async () => {
                if (!selected || !message.trim()) return;
                try {
                  setSendingMessage(true);
                  setMessageFeedback(null);
                  await sendEmployeeMessage({
                    employeeId: selected.id,
                    message,
                    type: messageType,
                  });
                  setMessage("");
                  setMessageFeedback("Message sent successfully. The employee will receive it in realtime.");
                } catch (error) {
                  setMessageFeedback(error instanceof Error ? error.message : "Unable to send message.");
                } finally {
                  setSendingMessage(false);
                }
              }}
            >
              {sendingMessage ? "Sending..." : "Send Message"}
            </Button>
            {messageFeedback ? (
              <span className="text-sm text-slate-600 dark:text-slate-300">{messageFeedback}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>Activity Overview</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Object.entries(counts ?? {}).map(([key,value])=><div key={key} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs uppercase text-slate-500">{key}</p><p className="mt-1 text-2xl font-bold">{String(value)}</p></div>)}</CardContent></Card>
    </>}
  </div>;
}
