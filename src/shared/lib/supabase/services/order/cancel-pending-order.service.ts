import type { SupabaseClient } from "@supabase/supabase-js";

export interface CancelOrderParams {
    orderId: string;
    profileId: string;
}

export async function cancelPendingOrder(
    supabase: SupabaseClient,
    { orderId, profileId }: CancelOrderParams
) {
    const { data, error } = await supabase
        .from("orders")
        .update({ status: "CANCELED", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("profile_id", profileId)
        .eq("status", "PENDING")
        .select("id")
        .maybeSingle();

    if (error) throw error;
    return data;
}
