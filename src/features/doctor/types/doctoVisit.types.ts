export interface DoctorVisit {
  id: string;

  employee_id: string;

  doctor_id: string;

  visit_date: string;

  visit_time: string;

  location: string;

  discussion: string;

  remarks: string;

  next_followup_date: string;

  latitude: number | null;

  longitude: number | null;

  created_at: string;

  updated_at: string;
}

export interface DoctorVisitProduct {
  id: string;

  visit_id: string;

  product_id: string;
}

export interface DoctorVisitForm {
  doctor_id: string;

  visit_date: string;

  visit_time: string;

  location: string;

  discussion: string;

  remarks: string;

  next_followup_date: string;

  latitude?: number;

  longitude?: number;

  product_ids: string[];
}