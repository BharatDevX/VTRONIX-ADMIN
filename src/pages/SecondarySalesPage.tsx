import EmployeeScopedPage from "./EmployeeScopedPage";
import { getSecondarySales } from "@/features/sales/services/secondarySales.service";

export default function SecondarySalesPage() {
  return (
    <EmployeeScopedPage
      title="Secondary Sale"
      description="Select an employee to view that employee's secondary sales."
      columns={[
        { key: "dealer_name", label: "Dealer" },
        { key: "product_name", label: "Product" },
        { key: "total_quantity", label: "Total Quantity" },
        { key: "total_amount", label: "Total Amount" },
      ]}
      load={(employeeId) => getSecondarySales(employeeId)}
    />
  );
}
