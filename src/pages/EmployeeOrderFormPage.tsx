import { ArrowLeft, FileDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmployeePicker } from "@/components/employee/EmployeePicker";
import {
  getAllEmployees,
  getEmployeeOrderFormDetails,
  getEmployeeOrderForms,
  
  type EmployeeOrderFormRow,
} from "@/features/adminEmployee/services/adminEmployee.service";
import type { Employee } from "@/types/domain";
import { printTableReport, renderOrderFormPdf } from "@/services/export.service";

const money = (value: number) => `₹${Number(value ?? 0).toFixed(2)}`;

function saleTypeLabel(type: string) {
  if (type === "farmer") return "Farmer Sale";
  if (type === "retailer") return "Retailer Sale";
  return "Dealer Sale";
}

export default function EmployeeOrderFormPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [rows, setRows] = useState<EmployeeOrderFormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
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

  useEffect(() => {
    void loadEmployees();
  }, []);

  const selectEmployee = async (employee: Employee) => {
    setSelected(employee);
    setLoading(true);
    setError(null);
    try {
      setRows(await getEmployeeOrderForms(employee.id));
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Unable to load order forms.");
    } finally {
      setLoading(false);
    }
  };

  const generateIndividualPdf = async (row: EmployeeOrderFormRow) => {
    if (!selected) return;

    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) {
      setError("Please allow pop-ups in your browser to generate the PDF.");
      return;
    }

    setPdfLoadingId(row.order_number);
    try {
      popup.document.write(
        '<p style="font-family:Arial;padding:24px">Preparing order form PDF...</p>',
      );

      const details = await getEmployeeOrderFormDetails(
        selected.id,
        row.order_number,
      );

      if (!details) {
        throw new Error("Order form details could not be found.");
      }

      renderOrderFormPdf(popup, details);
    } catch (err) {
      popup.close();
      setError(err instanceof Error ? err.message : "Unable to generate order form PDF.");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const generateReportPdf = () => {
    if (!selected) return;

    printTableReport(
      "Order Form Report",
      `${selected.full_name} · Detailed Order Form Records`,
      [
        { key: "sale_date", label: "Date" },
        { key: "order_number", label: "Order Number" },
        { key: "sale_type", label: "Type" },
        { key: "customer_name", label: "Customer" },
        { key: "hq", label: "Head Quarter" },
        { key: "amount", label: "Amount" },
      ],
      rows,
    );
  };

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <PageHeader
        title={selected ? `Order Form — ${selected.full_name}` : "Order Form"}
        description="Order summary by employee. Product-wise details are available inside each order PDF."
        actions={
          selected ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void selectEmployee(selected)}>
                <RefreshCw className="size-4" /> Refresh
              </Button>
              <Button variant="outline" onClick={generateReportPdf}>
                <FileDown className="size-4" /> PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setRows([]);
                  setError(null);
                }}
              >
                <ArrowLeft className="size-4" /> Employees
              </Button>
            </div>
          ) : undefined
        }
      />

      {!selected ? (
        <EmployeePicker
          employees={employees}
          selectedId=""
          onSelect={(employee) => void selectEmployee(employee)}
        />
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle>{rows.length} orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No order form records found for this employee.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Order Number</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Head Quarter</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                      <th className="px-3 py-3">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr className="border-b last:border-0 dark:border-slate-800" key={row.order_number}>
                        <td className="px-3 py-3 align-top whitespace-nowrap">{row.sale_date}</td>
                        <td className="px-3 py-3 align-top font-semibold whitespace-nowrap">{row.order_number}</td>
                        <td className="px-3 py-3 align-top whitespace-nowrap">{saleTypeLabel(row.sale_type)}</td>
                        <td className="px-3 py-3 align-top font-semibold">{row.customer_name}</td>
                        <td className="px-3 py-3 align-top">{row.hq || "—"}</td>
                        <td className="px-3 py-3 align-top font-semibold text-right">{money(row.amount)}</td>
                        <td className="px-3 py-3 align-top">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pdfLoadingId === row.order_number}
                            onClick={() => void generateIndividualPdf(row)}
                          >
                            <FileDown className="size-4" />
                            {pdfLoadingId === row.order_number ? "Preparing..." : "Generate PDF"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {!selected && loading && employees.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            Loading employees...
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
