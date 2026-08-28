import { createAdminClient } from "../../admin";

export async function getSubscriptionById(
    subscriptionId: string
) {
    const supabase = await createAdminClient();

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
