export interface FarmerMeetingPlan {
  id: string;
  employee_id: string;
  farmer_name: string;
  location: string;
  planned_date: string;
  note: string | null;
  month: number;
  year: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FarmerMeetingPlanForm {
  farmer_name: string;
  location: string;
  planned_date: string;
  note: string;
}
