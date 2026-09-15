export interface LoginForm {
  employeeId: string;
  password: string;
}

export interface Employee {
  id: string;
  auth_id: string;

  employee_id: string;

  full_name: string;
  designation: string;
  branch: string;
  head_quarters?: string[] | null;

  mobile: string;
  email: string;

  dob?: string | null;
  gender?: string | null;
  profile_image?: string | null;

  is_active: boolean;

  created_at: string;
}