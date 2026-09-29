import EmployeeScopedPage from "./EmployeeScopedPage";
import { getSecondarySales } from "@/features/sales/services/secondarySales.service";

export default function SecondarySalesPage() {
  return (
    <EmployeeScopedPage
      title="Secondary Sale"
      description="Select an employee to view that employee's detailed secondary sales."
      columns={[
        { key: "sale_date", label: "Date" },
        { key: "employee_name", label: "Employee" },
        { key: "dealer_name", label: "Dealer" },
        { key: "hq", label: "Head Quarter" },
        { key: "product_name", label: "Product" },
        { key: "pack_size", label: "Pack Size" },
        { key: "quantity", label: "Qty" },
        { key: "rate", label: "Rate" },
        { key: "amount", label: "Amount" },
      ]}
      load={(employeeId) => getSecondarySales(employeeId)}
    />
  );
}
