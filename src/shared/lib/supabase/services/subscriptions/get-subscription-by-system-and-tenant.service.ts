import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "../../admin";

export async function getSubscriptionBySystemAndTenant(
    systemId: string,
    tenantId: string
) {
    const supabase = await createAdminClient();

    const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("system_id", systemId)
        .eq("tenant_id", tenantId)
        .maybeSingle();

    if (error) {
        console.error(
            "Error fetching subscription context:",
            error
        );
        throw error;
    }

    return subscription;
}