import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeDealerPlans } from "@/features/adminEmployee/services/adminEmployee.service";

export default function DealerMeetingPlanPage() {
  return <EmployeeScopedPage title="Dealer Meeting Plan" description="View each employee's dealer meeting plans separately for the current month." columns={[{key:"planned_date",label:"Planned Date"},{key:"dealer_name",label:"Dealer"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"}]} load={async (employeeId) => getEmployeeDealerPlans(employeeId)} />;
}
