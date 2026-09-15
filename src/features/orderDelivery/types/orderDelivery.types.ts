export type DeliveryStatus = "delivered" | "partial" | "completed";

export interface OrderDelivery {
  id: string;
  sale_id: string;
  employee_id: string;
  delivered_amount: number;
  delivery_date: string;
  expected_delivery_date: string | null;
  status: DeliveryStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderInvoice {
  id: string;
  sale_id: string;
  delivery_id: string;
  employee_id: string;
  invoice_number: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  uploaded_at: string;
}

export interface EmployeeOrderDelivery {
  sale: {
    id: string;
    sale_date: string;
    amount: number;
    quantity: number;
    rate: number;
    sale_type: string;
    doctor_name: string;
    dealer_name: string;
    product_name: string;
  };
  deliveries: OrderDelivery[];
  invoices: OrderInvoice[];
  deliveredAmount: number;
  remainingAmount: number;
}
