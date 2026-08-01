import { z } from "zod";

export const orderStatus = [
    "PENDING",
    "PAID",
    "FAILED",
    "CANCELED",
    "REFUNDED",
] as const;

export const orderSchema = z.object({
    id: z.string().uuid(),

    system_id: z.string().uuid(),

    subscription_id: z.string().uuid().optional().nullable(),

    // Buyer
    profile_id: z.string().uuid(),

    // Coupon Snapshot
    coupon_id: z.string().uuid().optional().nullable(),

    // Pricing Snapshot
    original_amount: z.number().min(0),

    discount_amount: z.number().min(0).default(0),

    // Final amount paid
    amount: z.number().min(0),

    currency: z.string().default("EGP"),

    status: z.enum(orderStatus).default("PENDING"),

    description: z.string().optional().nullable(),

    // Subscription only
    plan: z.string().optional().nullable(),

    // SUBSCRIPTION | RESELLER | EXCLUSIVE
    license_type: z.string(),

    created_at: z.coerce.date(),

    updated_at: z.coerce.date().optional().nullable(),
});

export type Order = z.infer<typeof orderSchema>;