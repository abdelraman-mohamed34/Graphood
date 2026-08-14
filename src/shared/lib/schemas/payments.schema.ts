import { z } from "zod";

export const paymentProvider = [
    "KASHIER",
] as const;

export const paymentStatus = [
    "PENDING",
    "SUCCESS",
    "FAILED",
    "REFUNDED",
] as const;

export const paymentSchema = z.object({
    id: z.string().uuid(),

    order_id: z.string().uuid(),
    provider_reference: z.string().optional().nullable(),
    provider: z.enum(paymentProvider),

    amount: z.number().min(0),
    currency: z.string().default("EGP"),

    status: z.enum(paymentStatus).default("PENDING"),

    transaction_ref: z.string().optional(),

    paid_at: z.coerce.date().optional(),

    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
