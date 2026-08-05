import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMembershipById(
    supabase: SupabaseClient,
    membershipId: string,
) {
    const { data, error } = await supabase
        .from("memberships")
        .select("id, tenant_id, profile_id, role, permissions, status")
        .eq("id", membershipId)
        .maybeSingle();

    if (error) throw error;
    return data;
}
