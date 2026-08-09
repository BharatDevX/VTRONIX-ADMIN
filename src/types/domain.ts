export type Role =
  | "admin"
  | "employee";

export type EntityStatus = "active" | "inactive";

export interface Employee {
  id: string;
  auth_id: string | null;
  employee_id: string;
  full_name: string;
  designation: string;
  branch: string;
  mobile: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFilters {
  page: number;
  pageSize: number;
  search: string;
  branch: string;
  designation: string;
  isActive: "all" | "active" | "inactive";
}

export interface EmployeeListResponse {
  data: Employee[];
  count: number;
}

export interface EmployeeCreateInput {
  employee_id: string;
  full_name: string;
  designation: string;
  branch: string;
  mobile: string;
  email: string;
  password: string;
}

export type EmployeeUpdateInput = Partial<Omit<EmployeeCreateInput, "password" | "employee_id">> & {
  is_active?: boolean;
};

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export type ExistingAttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  branch: string;
  attendance_date: string;
  status: ExistingAttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  address: string | null;
  working_minutes: number;
  total_km: number;
}

export interface SalesRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  branch: string;
  sale_date: string;
  channel: "counter" | "doctor" | "retailer" | "farmer";
  customer_name: string;
  doctor_name: string | null;
  dealer_name: string;
  retailer_name?: string | null;
  farmer_name?: string | null;
  amount: number;
  product_name: string;
  quantity: number;
  rate: number;
}

export interface Doctor {
  id: string;
  doctor_name: string;
  specialization: string;
  city: string;
  mobile: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Retailer {
  id: string;
  retailer_name: string;
  city: string;
  mobile: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dealer {
  id: string;
  dealer_name: string;
  contact_person: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  address: string;
  gst_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  entity_name: string;
  city: string;
  visit_date: string;
  visit_time: string | null;
  outcome: string;
  next_action: string | null;
}

export interface DoctorVisitRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  doctor_name: string;
  city: string;
  visit_date: string;
  discussion: string;
  reply: string | null;
  next_followup_date: string | null;
  status: string | null;
  created_at: string | null;
}

export interface MtpRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  month: number;
  year: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  remarks: string | null;
  planned_days: number;
  total_km: number;
  approved_by: string | null;
  updated_at: string;
}

export interface TrackingRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_number: string;
  branch: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  battery_percent: number | null;
  is_working: boolean;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  severity: "info" | "success" | "warning" | "error";
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;

  presentToday: number;
  absentToday: number;

  todaysSales: number;
  monthlySales: number;

  counterSale: number;
  doctorSale: number;
  retailerSale: number;
  farmerSale: number;

  todaysKm: number;
}

export interface TrendPoint {
  label: string;
  sales: number;
  attendance: number;
  revenue: number;
  doctorVisits: number;
  dealerVisits: number;
}

export interface ActivityRecord {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface TopPerformer {
  employee_id: string;
  employee_name: string;
  branch: string;
  revenue: number;
  visits: number;
}

export interface MtpEntry {
  id: string;
  programme_id: string;
  tour_date: string;
  day_type: string | null;
  route_details: string | null;
  travel_mode: string | null;
  route_number: string | null;
  total_km: number;
  planned_customers: number | null;
  sequence_number: number | null;
  status: string | null;
}

export interface MtpEntrySummary {
  totalTourDays: number;
  totalRoutes: number;
  totalKm: number;
  totalPlannedCustomers: number;
}

export interface MtpProgrammeEntriesResponse {
  entries: MtpEntry[];
  summary: MtpEntrySummary;
}

export interface PaginatedQuery {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  branch: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}