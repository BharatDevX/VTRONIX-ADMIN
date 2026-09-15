export interface DoctorMeetingPlan {
  id: string;
  employee_id: string;
  doctor_id: string;
  location: string;
  planned_date: string;
  discussion: string;
  reply: string | null;
  month: number;
  year: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorMeetingPlanProduct {
  id: string;
  plan_id: string;
  product_id: string;
}

export interface DoctorMeetingPlanForm {
  doctor_id: string;
  location: string;
  planned_date: string;
  reply?: string;
}
