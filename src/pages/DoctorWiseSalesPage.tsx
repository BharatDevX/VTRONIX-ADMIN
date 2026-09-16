import EmployeeScopedPage from "./EmployeeScopedPage";
import { getDoctorWiseSales } from "@/features/sales/services/doctorWiseSale.service";

export default function DoctorWiseSalesPage() {
  return (
    <EmployeeScopedPage
      title="Doctor Wise Sale"
      description="Select an employee to view that employee's doctor-wise sales."
      columns={[
        { key: "sale_date", label: "Date" },
        { key: "doctor_name", label: "Doctor" },
        { key: "dealer_name", label: "Dealer" },
        { key: "retailer_name", label: "Retailer" },
        { key: "product_name", label: "Product" },
        { key: "quantity", label: "Quantity" },
        { key: "rate", label: "Rate" },
        { key: "amount", label: "Amount" },
      ]}
      load={(employeeId) => getDoctorWiseSales(employeeId)}
    />
  );
}
