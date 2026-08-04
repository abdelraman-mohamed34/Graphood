import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "../../admin";

export async function getSubscriptionById(
    subscriptionId: string
) {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .maybeSingle();

    if (error) {
        console.error(
            "Error fetching subscription:",
            error
        );
        throw error;
    }

    return data;
}