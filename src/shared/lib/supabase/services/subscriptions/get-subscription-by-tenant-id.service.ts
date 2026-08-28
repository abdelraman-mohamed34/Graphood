// src/shared/lib/supabase/services/subscriptions/get-subscription-by-tenant-id.service.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subscription } from "@/shared/lib/schemas/subscriptions.schema";

export async function getSubscriptionByTenantID<T = Subscription>(
    supabase: SupabaseClient,
    tenantId: string
): Promise<T | null> {
    // 1. Get tenant
    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("subscription_id")
        .eq("id", tenantId)
        .maybeSingle();

    if (tenantError) {
        throw tenantError;
    }

    if (!tenant?.subscription_id) {
        return null;
    }

    // 2. Get subscription
    const { data: subscription, error: subscriptionError } =
        await supabase
            .from("subscriptions")
            .select("id, plan_name, license_type, billing_interval, status, end_date")
            .eq("id", tenant.subscription_id)
            .maybeSingle();

    if (subscriptionError) {
        throw subscriptionError;
    }

    if (!subscription) {
        return null;
    }

    return subscription as T;
}
