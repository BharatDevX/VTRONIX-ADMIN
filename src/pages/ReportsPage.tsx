import { Download, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportSummary } from "@/features/reports/hooks";
import { exportCSV, exportExcel, printReport } from "@/services/export.service";

const reportCards = [
  { key: "attendance", label: "Attendance" },
  { key: "sales", label: "Sales" },
  { key: "doctor", label: "Doctor" },
  { key: "dealer", label: "Dealer" },
  { key: "employees", label: "Employee" },
  { key: "mtp", label: "MTP" },
] as const;

export default function ReportsPage() {
  const summary = useReportSummary();

  return (
    <div>
      <PageHeader description="Central export hub for attendance, sales, doctor, dealer, employee, and MTP reports." eyebrow="Exports" title="Reports" />
      <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => {
          const records = summary.data?.[report.key] ?? 0;

          return (
            <Card key={report.key}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-slate-700">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">{report.label} report</h2>
                    {summary.isLoading ? <Skeleton className="mt-2 h-4 w-24" /> : <p className="text-sm text-slate-500 dark:text-slate-400">{records} records available</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
  onClick={() =>
    exportCSV(
      `${report.key}-report.csv`,
      [
        {
          generated_at: new Date().toISOString(),
          records,
          report: report.label,
        },
      ]
    )
  }
  variant="outline"
>
  <Download />
  CSV
</Button>
                <Button
  onClick={() =>
    exportExcel(
      `${report.key}-report.xlsx`,
      [
        {
          generated_at: new Date().toISOString(),
          records,
          report: report.label,
        },
      ]
    )
  }
  variant="outline"
>
  <Download />
  Excel
</Button>
                <Button onClick={printReport} variant="outline">
                  <Printer />
                  PDF
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
