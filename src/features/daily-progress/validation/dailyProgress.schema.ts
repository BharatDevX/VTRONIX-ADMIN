import { z } from "zod";

export const DailyProgressSchema = z.object({

    remarks: z.string().optional(),

});

export const DailyProgressEntrySchema = z.object({

    party_type: z.enum(["doctor","dealer"]),

    contact_person: z.string().min(1),

    discussion: z.string().min(1),

    reply: z.string().min(1),

    pob_amount: z.number().min(0)

});