export interface FarmerVisit {
  id: string;
  employee_id: string;
  farmer_name: string;
  visit_date: string;
  visit_time: string;
  location: string;
  discussion: string;
  outcome: string;
  next_followup_date: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerVisitForm {
  farmer_name: string;
  visit_date: string;
  visit_time: string;
  location: string;
  discussion: string;
  outcome: string;
  next_followup_date: string;
}
