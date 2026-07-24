import { z } from "zod";
import { status } from "./public/shared";

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
    tenant_id: z.string().uuid(),
    subscription_id: z.string().uuid().optional(),

    // who is paying
    profile_id: z.string().uuid(),

    amount: z.number().min(0),
    currency: z.string().default("EGP"),

    status: z.enum(orderStatus).default("PENDING"),

    description: z.string().optional(),
    plan: z.string(),
    license_type: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Order = z.infer<typeof orderSchema>;