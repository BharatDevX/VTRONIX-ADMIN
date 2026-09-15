export interface DealerVisit {

    id: string;

    employee_id: string;

    dealer_id: string;

    visit_date: string;

    visit_time: string;

    location: string;

    discussion: string;

    outcome: string;

    next_followup_date: string;

    latitude: number | null;

    longitude: number | null;

    created_at: string;

    updated_at: string;

}

export interface DealerVisitForm {

    dealer_id: string;

    visit_date: string;

    visit_time: string;

    location: string;

    discussion: string;

    outcome: string;

    next_followup_date: string;

    latitude?: number;

    longitude?: number;

}