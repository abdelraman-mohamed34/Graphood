// src/shared/lib/supabase/services/subscriptions/get-subscription-by-tenant-id.service.ts

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSubscriptionByTenantID<T = any>(
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
        console.error(
            "[Supabase Error] Error fetching tenant:",
            JSON.stringify(tenantError, null, 2)
        );
        throw tenantError;
    }

    if (!tenant?.subscription_id) {
        return null;
    }

    // 2. Get subscription
    const { data: subscription, error: subscriptionError } =
        await supabase
            .from("subscriptions")
            .select("*")
            .eq("id", tenant.subscription_id)
            .maybeSingle();

    if (subscriptionError) {
        console.error(
            "[Supabase Error] Error fetching subscription:",
            JSON.stringify(subscriptionError, null, 2)
        );
        throw subscriptionError;
    }

    if (!subscription) {
        return null;
    }

    return subscription as T;
}