import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeFarmerPlans } from "@/features/adminEmployee/services/adminEmployee.service";

export default function FarmerMeetingPlanPage() {
  return <EmployeeScopedPage title="Farmer Meeting Plan" description="View each employee's farmer meeting plans separately for the current month." columns={[{key:"planned_date",label:"Planned Date"},{key:"farmer_name",label:"Farmer"},{key:"location",label:"Location"},{key:"note",label:"Note"}]} load={async (employeeId) => getEmployeeFarmerPlans(employeeId)} />;
}
