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

        throw error;
    }

    return tenant;
}