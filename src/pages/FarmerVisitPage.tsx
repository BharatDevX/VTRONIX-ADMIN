import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeFarmerVisits } from "@/features/adminEmployee/services/adminEmployee.service";

export default function FarmerVisitPage() {
  return <EmployeeScopedPage title="Farmer Visits" description="View farmer visits employee-by-employee instead of mixing all field staff records." columns={[{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"farmer_name",label:"Farmer"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"},{key:"next_followup_date",label:"Next Follow-up"}]} load={async (employeeId) => getEmployeeFarmerVisits(employeeId)} />;
}
