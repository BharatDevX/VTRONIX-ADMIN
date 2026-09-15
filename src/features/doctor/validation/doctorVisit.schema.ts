import { z } from "zod";

export const DoctorVisitSchema = z.object({

    doctor_id:z.string().min(1),

    visit_date:z.string(),

    visit_time:z.string(),

    location:z.string().min(1),

    discussion:z.string().min(1),

    remarks:z.string(),

    next_followup_date:z.string(),

    product_ids:z.array(z.string())

});

export type DoctorVisitType=
z.infer<typeof DoctorVisitSchema>;