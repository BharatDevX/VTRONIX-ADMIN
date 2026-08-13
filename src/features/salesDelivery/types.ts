export type DeliveryStatus = "delivered" | "partial" | "completed";

export interface SaleDelivery {
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

export interface SaleInvoice {
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

export interface SaleDeliverySummary {
  orderedAmount: number;
  deliveredAmount: number;
  remainingAmount: number;
  status: "pending" | "partially_delivered" | "fully_delivered";
}
