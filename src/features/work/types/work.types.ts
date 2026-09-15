export interface WorkSession {
  id: string;
  employee_id: string;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  start_meter: number | null;
  end_meter: number | null;
  total_km: number;
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  status: "started" | "completed";
}

export interface StartWorkForm {
  latitude: number;
  longitude: number;
}

export interface EndWorkForm {
  latitude: number;
  longitude: number;
}