import { z } from "zod";

import { default_pay } from "./public/shared";
import { licenseTypes } from "@/shared/config/licensing";
import type { Tables } from "@/shared/types/database.types";

export const billingIntervals = [
    "MONTHLY",
    "YEARLY",
    "ONE_TIME",
] as const;

export const subscriptionStatus = [
    "ACTIVE",
    "TRIAL",
    "PAST_DUE",
    "CANCELED",
    "EXPIRED",
] as const;

export const subscriptionSchema = z.object({
    id: z.string().uuid("Invalid Subscription ID"),

    // Relations
    order_id: z.string().uuid("Invalid Order ID"),
    profile_id: z.string().uuid("Invalid Profile ID"),
    system_id: z.string().uuid("Invalid System ID"),

    // Plan snapshot
    plan_name: z.string().min(2),
    license_type: z.enum(licenseTypes).default("SUBSCRIPTION"),
    billing_interval: z.enum(billingIntervals),

    // Pricing snapshot
    price: z.number().min(0),
    currency: z.string().default(default_pay),

    // Lifecycle
    status: z.enum(subscriptionStatus).default("TRIAL"),

    // Dates
    start_date: z.coerce.date(),
    end_date: z.coerce.date().optional(),
    trial_end_date: z.coerce.date().optional(),

    // Settings
    auto_renew: z.boolean().default(true),


    created_at: z.coerce.date(),
    updated_at: z.coerce.date().optional(),
});

export type Subscription = Tables<"subscriptions">;
