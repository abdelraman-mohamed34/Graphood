import "server-only";

import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

const supabaseAdminEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url(),
    SUPABASE_SERVICE_ROLE_KEY: nonEmptyString,
});

const kashierCheckoutEnvSchema = z.object({
    KASHIER_MERCHANT_ID: nonEmptyString,
    KASHIER_API_KEY: nonEmptyString,
    KASHIER_SECRET_KEY: nonEmptyString,
    KASHIER_MODE: z.enum(["test", "live"]).default("test"),
    NEXT_PUBLIC_APP_URL: z.string().trim().url().optional(),
    KASHIER_REDIRECT_URL: z.string().trim().url().optional(),
});

const kashierWebhookEnvSchema = z.object({
    KASHIER_WEBHOOK_SECRET: nonEmptyString,
});

export type SupabaseAdminEnv = z.infer<typeof supabaseAdminEnvSchema>;
export type KashierCheckoutEnv = z.infer<typeof kashierCheckoutEnvSchema>;
export type KashierWebhookEnv = z.infer<typeof kashierWebhookEnvSchema>;

let cachedSupabaseAdminEnv: SupabaseAdminEnv | null = null;
let cachedKashierCheckoutEnv: KashierCheckoutEnv | null = null;
let cachedKashierWebhookEnv: KashierWebhookEnv | null = null;

export function getSupabaseAdminEnv() {
    if (!cachedSupabaseAdminEnv) {
        cachedSupabaseAdminEnv = supabaseAdminEnvSchema.parse(process.env);
    }

    return cachedSupabaseAdminEnv;
}

export function getKashierCheckoutEnv() {
    if (!cachedKashierCheckoutEnv) {
        cachedKashierCheckoutEnv = kashierCheckoutEnvSchema.parse(process.env);
    }

    return cachedKashierCheckoutEnv;
}

export function getKashierWebhookEnv() {
    if (!cachedKashierWebhookEnv) {
        cachedKashierWebhookEnv = kashierWebhookEnvSchema.parse(process.env);
    }

    return cachedKashierWebhookEnv;
}
