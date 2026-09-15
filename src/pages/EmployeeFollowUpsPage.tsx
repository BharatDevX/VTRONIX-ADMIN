import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeFollowUps } from "@/features/adminEmployee/services/adminEmployee.service";

export default function EmployeeFollowUpsPage() {
  return <EmployeeScopedPage title="Follow-Ups" description="Select an employee first to see only that employee's doctor, dealer and farmer follow-ups." columns={[{key:"visit_type",label:"Type"},{key:"party_name",label:"Party"},{key:"next_followup_date",label:"Follow-up Date"},{key:"visit_date",label:"Original Visit"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"}]} load={async (employeeId) => getEmployeeFollowUps(employeeId)} />;
}
