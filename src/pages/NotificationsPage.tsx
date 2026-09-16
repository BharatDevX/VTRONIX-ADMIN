import { ArrowLeft, Bell, MessageSquareText, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { getAllEmployees } from "@/features/adminEmployee/services/adminEmployee.service";
import {
  getEmployeeAdminMessages,
  type EmployeeAdminMessageRecord,
} from "@/features/employeeMessages/service";
import type { Employee } from "@/types/domain";
import { formatDateTime } from "@/lib/format";

function typeLabel(type: EmployeeAdminMessageRecord["message_type"]) {
  switch (type) {
    case "warning":
      return "Warning";
    case "alert":
      return "Alert";
    case "order":
      return "Order";
    default:
      return "Information";
  }
}

function typeClasses(type: EmployeeAdminMessageRecord["message_type"]) {
  switch (type) {
    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900";
    case "alert":
      return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900";
    case "order":
      return "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900";
    default:
      return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900";
  }
}

export default function NotificationsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [messages, setMessages] = useState<EmployeeAdminMessageRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAllEmployees()
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load employees."))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const loadMessages = async (employee: Employee) => {
    setSelected(employee);
    setLoadingMessages(true);
    setError(null);
    try {
      setMessages(await getEmployeeAdminMessages(employee.id));
    } catch (err) {
      setMessages([]);
      setError(err instanceof Error ? err.message : "Unable to load employee messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`admin-message-status-${selected.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "employee_admin_messages", filter: `employee_id=eq.${selected.id}` },
        (payload) => {
          const updated = payload.new as EmployeeAdminMessageRecord;
          setMessages((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [selected]);

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [employees],
  );

  return (
    <div>
      <PageHeader
        description="View every instruction, warning, alert, and order sent to an individual employee."
        eyebrow="Employee Messages"
        title="Notifications"
      />

      <div className="p-5">
        {!selected ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5" />
                Select Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmployees ? (
                <div className="py-12 text-center text-sm text-slate-500">Loading employees...</div>
              ) : sortedEmployees.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">No employees found.</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedEmployees.map((employee) => (
                    <button
                      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                      key={employee.id}
                      onClick={() => void loadMessages(employee)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {employee.full_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950 dark:text-white">
                            {employee.full_name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {employee.designation || employee.employee_id}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">
                        <MessageSquareText className="size-4" />
                        View message history
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <button
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              onClick={() => {
                setSelected(null);
                setMessages([]);
                setError(null);
              }}
              type="button"
            >
              <ArrowLeft className="size-4" />
              All Employees
            </button>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="size-5" />
                      {selected.full_name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      Complete admin message history for this employee.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {messages.length} {messages.length === 1 ? "message" : "messages"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingMessages ? (
                  <div className="py-12 text-center text-sm text-slate-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No admin messages have been sent to {selected.full_name}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((item) => (
                      <div
                        className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                        key={item.id}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-950 dark:text-white">
                                {item.title}
                              </h3>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${typeClasses(item.message_type)}`}>
                                {typeLabel(item.message_type)}
                              </span>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${item.status === "done" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                                {item.status === "done" ? "Done" : "Pending"}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {item.message}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5"><Bell className="size-3.5" />{formatDateTime(item.created_at)}</div>
                            {item.done_at ? <span className="text-emerald-600">Done {formatDateTime(item.done_at)}</span> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
