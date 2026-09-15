import EmployeeScopedPage from "./EmployeeScopedPage";
import { getEmployeeOrderForms } from "@/features/adminEmployee/services/adminEmployee.service";

export default function EmployeeOrderFormPage() {
  return <EmployeeScopedPage title="Order Form" description="Order Form records are grouped by employee so the admin can inspect one field employee at a time." columns={[{key:"sale_date",label:"Date"},{key:"sale_type",label:"Type"},{key:"customer_name",label:"Customer"},{key:"product_name",label:"Product"},{key:"quantity",label:"Quantity"},{key:"rate",label:"Rate"},{key:"amount",label:"Amount"}]} load={async (employeeId) => getEmployeeOrderForms(employeeId)} />;
}
