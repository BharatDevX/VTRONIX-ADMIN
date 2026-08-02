import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { OperationalPage } from "@/components/operations/OperationalPage";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAttendance } from "@/features/attendance/hooks";
import { formatDate } from "@/lib/format";
import type { AttendanceRecord, PaginatedQuery } from "@/types/domain";

const initialFilters: PaginatedQuery = { branch: "", page: 1, pageSize: 12, search: "", status: "all" };

export default function AttendancePage() {
  const [filters, setFilters] = useState(initialFilters);
  const attendance = useAttendance(filters);
  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      { accessorKey: "employee_name", header: "Employee" },
      { accessorKey: "branch", header: "Branch" },
      { accessorKey: "attendance_date", cell: ({ row }) => formatDate(row.original.attendance_date), header: "Date" },
      { accessorKey: "status", cell: ({ row }) => <StatusBadge value={row.original.status} />, header: "Status" },
      { accessorKey: "check_in_time", header: "Check In" },
      { accessorKey: "check_out_time", header: "Check Out" },
      { accessorKey: "working_minutes", cell: ({ row }) => `${row.original.working_minutes} min`, header: "Work Time" },
    ],
    [],
  );

  return (
    <OperationalPage
      columns={columns}
      count={attendance.data?.count ?? 0}
      data={attendance.data?.data ?? []}
      description="Daily present, absent, late, leave, monthly attendance reports, and CSV export."
      emptyDescription="Attendance records from the employee app will appear here."
      emptyTitle="No attendance found"
      exportFilename="attendance.csv"
      filters={filters}
      isLoading={attendance.isLoading}
      rowsForExport={(records) => records.map((record) => ({ branch: record.branch, date: record.attendance_date, employee: record.employee_name, km: record.total_km, status: record.status }))}
      setFilters={setFilters}
      statusOptions={[
        { label: "Present", value: "PRESENT" },
        { label: "Absent", value: "ABSENT" },
        { label: "Leave", value: "LEAVE" },
        { label: "Half Day", value: "HALF_DAY" },
      ]}
      title="Attendance"
    />
  );
}
