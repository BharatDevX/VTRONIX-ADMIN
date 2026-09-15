import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeDealerVisits } from "@/features/adminEmployee/services/adminEmployee.service";

export default function DealerEmployeeVisitsPage() {
  return <EmployeeScopedPage title="Dealer Visits" description="Select an employee first, then view only that employee's dealer visits." columns={[{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"dealer_name",label:"Dealer"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"},{key:"next_followup_date",label:"Next Follow-up"}]} load={async (employeeId) => getEmployeeDealerVisits(employeeId)} />;
}
