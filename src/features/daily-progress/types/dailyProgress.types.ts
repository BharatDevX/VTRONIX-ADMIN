export type PartyType = "doctor" | "dealer";

export interface DailyProgress {

    id: string;

    employee_id: string;

    work_session_id: string | null;

    report_date: string;

    start_meter: number;

    end_meter: number;

    total_km: number;

    remarks: string;

    status: "draft" | "submitted";
}

export interface DailyProgressEntry {

    id: string;

    daily_progress_id: string;

    serial_no: number;

    party_type: PartyType;

    doctor_id: string | null;

    dealer_id: string | null;

    contact_person: string;

    discussion: string;

    reply: string;

    pob_amount: number;
}