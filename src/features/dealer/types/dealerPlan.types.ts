export interface DealerMeetingPlan {
  id: string;
  employee_id: string;
  dealer_id: string;
  month: number;
  year: number;
  location: string;
  planned_date: string;
  meeting_date: string;
  discussion: string;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealerMeetingPlanForm {
  dealer_id: string;
  location: string;
  planned_date: string;
  discussion: string;
}
