import EmployeeScopedPage from "./EmployeeScopedPage";
import { getCounterSales } from "@/features/sales/services/counterSale.service";

export default function CounterSalesPage() {
  return (
    <EmployeeScopedPage
      title="Counter Sale"
      description="Select an employee to view that employee's counter sales."
      columns={[
        { key: "sale_date", label: "Date" },
        { key: "dealer_name", label: "Dealer" },
        { key: "product_name", label: "Product" },
        { key: "quantity", label: "Quantity" },
        { key: "rate", label: "Rate" },
        { key: "amount", label: "Amount" },
      ]}
      load={(employeeId) => getCounterSales(employeeId)}
    />
  );
}
