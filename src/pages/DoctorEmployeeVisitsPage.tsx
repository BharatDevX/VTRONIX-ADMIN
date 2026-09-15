import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeDoctorVisits } from "@/features/adminEmployee/services/adminEmployee.service";

export default function DoctorEmployeeVisitsPage() {
  return <EmployeeScopedPage title="Doctor Visits" description="Select an employee first, then view only that employee's doctor visits." columns={[{key:"visit_date",label:"Date"},{key:"visit_time",label:"Time"},{key:"doctor_name",label:"Doctor"},{key:"location",label:"Location"},{key:"discussion",label:"Discussion"},{key:"outcome",label:"Outcome"},{key:"next_followup_date",label:"Next Follow-up"}]} load={async (employeeId) => getEmployeeDoctorVisits(employeeId)} />;
}
