import { SupabaseClient } from "@supabase/supabase-js";

export async function getTenantById(
    tenantId: string,
    supabase: SupabaseClient
) {
    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .maybeSingle();

    if (error) {
        console.error(
            "Error fetching tenant by id:",
            error
        );

        throw error;
    }

    return tenant;
}