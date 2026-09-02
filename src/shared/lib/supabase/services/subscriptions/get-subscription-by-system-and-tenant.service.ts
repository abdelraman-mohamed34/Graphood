import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSubscriptionById(
    supabase: SupabaseClient,
    subscriptionId: string
) {
    const { data, error } = await supabase
        .from("subscriptions")
        .select("id, plan_name, license_type, billing_interval, status, end_date")
        .eq("id", subscriptionId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}
