import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeDoctorPlans } from "@/features/adminEmployee/services/adminEmployee.service";

export default function DoctorMeetingPlanPage() {
  return <EmployeeScopedPage title="Doctor Meeting Plan" description="View each employee's doctor meeting plans separately for the current month." columns={[{key:"planned_date",label:"Planned Date"},{key:"doctor_name",label:"Doctor"},{key:"location",label:"Location"},{key:"reply",label:"Reply"},{key:"discussion",label:"Discussion"}]} load={async (employeeId) => getEmployeeDoctorPlans(employeeId)} />;
}
