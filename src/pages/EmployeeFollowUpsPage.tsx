import EmployeeScopedPage from "./EmployeeScopedPage";
import { getAdminFollowUps } from "@/features/followUps/service";

export default function EmployeeFollowUpsPage() {
  return (
    <EmployeeScopedPage
      title="Follow-Ups"
      description="Select an employee first to see only that employee's doctor, dealer and farmer follow-ups, including completion status and delay."
      columns={[
        { key: "visit_type", label: "Type" },
        { key: "party_name", label: "Party" },
        { key: "follow_up_date", label: "Follow-up Date" },
        { key: "original_visit_date", label: "Original Visit" },
        { key: "status", label: "Status" },
        { key: "completed_visit_date", label: "Completed Visit" },
        { key: "delay", label: "Delay" },
        { key: "location", label: "Location" },
        { key: "discussion", label: "Discussion" },
        { key: "outcome", label: "Outcome" },
      ]}
      load={async (employeeId) => {
        const records = await getAdminFollowUps();
        return records
          .filter((record) => record.employee_id === employeeId)
          .map((record) => ({
            ...record,
            status: record.completed ? "Completed" : record.delay_days > 0 ? "Delayed" : "Pending",
            delay: record.completed
              ? record.delay_days === 0
                ? "On time"
                : `${record.delay_days} day(s) late`
              : record.delay_days > 0
                ? `${record.delay_days} day(s) overdue`
                : "—",
          }));
      }}
    />
  );
}
