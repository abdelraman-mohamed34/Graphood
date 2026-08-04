import { SupabaseClient } from "@supabase/supabase-js";

export async function getMembershipsByTenantId(
    tenantId: string,
    supabase: SupabaseClient
) {
    const { data: memberships, error } = await supabase
        .from("memberships")
        .select(`
            id,
            profile_id,
            tenant_id,
            role,
            permissions,
            status,
            joined_at,
            created_at,
            profile:profiles!profile_id (
                id,
                first_name,
                last_name,
                email,
                avatar_url
            )
        `)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error(
            "Error fetching memberships by tenant id:",
            error
        );

        throw error;
    }

    return memberships ?? [];
}